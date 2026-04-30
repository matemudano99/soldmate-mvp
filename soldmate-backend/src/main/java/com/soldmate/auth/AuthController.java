package com.soldmate.auth;

import com.soldmate.company.Company;
import com.soldmate.company.CompanyRepository;
import com.soldmate.company.CompanySettingsService;
import com.soldmate.company.NifCifValidator;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController: registro y login.
 *
 * Diferencia respecto a la versión anterior:
 *   - Al registrar, llamamos a settingsService.createDefaultSettings(company)
 *     para que cada empresa nueva tenga sus ajustes de IVA y categorías listos.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository          userRepository;
    private final CompanyRepository       companyRepository;
    private final PasswordEncoder         passwordEncoder;
    private final JwtUtil                 jwtUtil;
    private final NifCifValidator         nifCifValidator;
    private final CompanySettingsService  settingsService;

    public AuthController(UserRepository userRepository,
                          CompanyRepository companyRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          NifCifValidator nifCifValidator,
                          CompanySettingsService settingsService) {
        this.userRepository   = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder  = passwordEncoder;
        this.jwtUtil          = jwtUtil;
        this.nifCifValidator  = nifCifValidator;
        this.settingsService  = settingsService;
    }

    // ─── DTOs ────────────────────────────────────────────────────────────────

    public record RegisterRequest(
        @NotBlank String companyName,
        @NotBlank String taxId,
        @NotBlank @Size(min = 2, max = 2) String country,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        String firstName,
        String lastName
    ) {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record UpdateProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName
    ) {}

    public record AuthResponse(
        String token,
        String email,
        String role,
        String tier,
        Long   companyId,
        String firstName,
        String lastName
    ) {}

    // ─── POST /api/v1/auth/register ──────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {

        // 1. Validar NIF/CIF para empresas españolas
        if (!nifCifValidator.isValid(req.taxId(), req.country())) {
            return ResponseEntity.badRequest()
                .body("NIF/CIF inválido para el país: " + req.country());
        }

        // 2. Email único
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Ya existe un usuario con ese email");
        }

        // 3. Crear empresa
        Company company = new Company();
        company.setName(req.companyName());
        company.setTaxId(req.taxId().toUpperCase().trim());
        company.setCountry(req.country().toUpperCase());
        company.setCurrency("EUR"); // por ahora EUR por defecto
        companyRepository.save(company);

        // 4. Crear ajustes por defecto (IVA, categorías, estados de pedido)
        // Esto se ejecuta dentro de una transacción: si falla, se deshace todo
        settingsService.createDefaultSettings(company);

        // 5. Crear usuario dueño
        User user = new User();
        user.setEmail(req.email().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setRole(User.Role.OWNER);
        user.setCompany(company);
        userRepository.save(user);

        // 6. Generar JWT y responder
        String token = jwtUtil.generateToken(
            user.getEmail(),
            company.getId(),
            user.getRole().name(),
            company.getSubscriptionTier().name()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
            new AuthResponse(token, user.getEmail(), user.getRole().name(),
                             company.getSubscriptionTier().name(), company.getId(),
                             user.getFirstName(), user.getLastName())
        );
    }

    // ─── POST /api/v1/auth/login ─────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email().toLowerCase().trim())
            .orElse(null);

        // Mismo mensaje para email y contraseña incorrectos (evita enumeración)
        if (user == null || !passwordEncoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Credenciales incorrectas");
        }

        Company company = user.getCompany();
        String token = jwtUtil.generateToken(
            user.getEmail(),
            company.getId(),
            user.getRole().name(),
            company.getSubscriptionTier().name()
        );

        return ResponseEntity.ok(
            new AuthResponse(token, user.getEmail(), user.getRole().name(),
                             company.getSubscriptionTier().name(), company.getId(),
                             user.getFirstName(), user.getLastName())
        );
    }

    // ─── GET /api/v1/auth/me ─────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.substring(7));
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        Company company = user.getCompany();
        return ResponseEntity.ok(
            new AuthResponse(
                authHeader.substring(7),
                user.getEmail(),
                user.getRole().name(),
                company.getSubscriptionTier().name(),
                company.getId(),
                user.getFirstName(),
                user.getLastName()
            )
        );
    }

    // ─── PUT /api/v1/auth/profile ────────────────────────────────────────────

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
        @RequestHeader("Authorization") String authHeader,
        @Valid @RequestBody UpdateProfileRequest req
    ) {
        String email = jwtUtil.extractEmail(authHeader.substring(7));
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        userRepository.save(user);

        Company company = user.getCompany();
        return ResponseEntity.ok(
            new AuthResponse(
                authHeader.substring(7),
                user.getEmail(),
                user.getRole().name(),
                company.getSubscriptionTier().name(),
                company.getId(),
                user.getFirstName(),
                user.getLastName()
            )
        );
    }
}
