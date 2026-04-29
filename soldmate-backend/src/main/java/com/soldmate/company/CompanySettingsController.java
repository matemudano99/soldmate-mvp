package com.soldmate.company;

import com.soldmate.auth.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CompanySettingsController: endpoints para gestionar la configuración.
 *
 * Rutas:
 *   GET    /api/v1/settings              → todos los ajustes
 *   GET    /api/v1/settings?group=VAT    → ajustes de un grupo
 *   POST   /api/v1/settings              → crear ajuste (solo OWNER)
 *   PUT    /api/v1/settings/{id}         → actualizar ajuste (solo OWNER)
 *   DELETE /api/v1/settings/{id}         → desactivar ajuste (solo OWNER)
 */
@RestController
@RequestMapping("/api/v1/settings")
public class CompanySettingsController {

    private final CompanySettingsService settingsService;
    private final JwtUtil                jwtUtil;

    public CompanySettingsController(CompanySettingsService settingsService,
                                     JwtUtil jwtUtil) {
        this.settingsService = settingsService;
        this.jwtUtil         = jwtUtil;
    }

    // ─── DTOs ────────────────────────────────────────────────────────────────

    public record SettingResponse(
        Long   id,
        String key,
        String value,
        String label,
        String group,
        int    displayOrder
    ) {
        public static SettingResponse from(CompanySetting s) {
            return new SettingResponse(
                s.getId(), s.getKey(), s.getValue(),
                s.getLabel(), s.getGroup(), s.getDisplayOrder()
            );
        }
    }

    // Los ajustes agrupados son más fáciles de consumir en el frontend
    // Ejemplo: { "VAT": [...], "CATEGORY": [...], "ORDER_STATUS": [...] }
    public record GroupedSettingsResponse(Map<String, List<SettingResponse>> groups) {}

    public record CreateSettingRequest(
        @NotBlank String key,
        @NotBlank String value,
        @NotBlank String label,
        @NotBlank String group
    ) {}

    public record UpdateSettingRequest(
        @NotBlank String value,
        String label
    ) {}

    // ─── Endpoints ───────────────────────────────────────────────────────────

    /**
     * GET /api/v1/settings
     * GET /api/v1/settings?group=VAT
     *
     * Devuelve los ajustes agrupados por categoría.
     * El parámetro ?group= es opcional: sin él devuelve todos los grupos.
     */
    @GetMapping
    public ResponseEntity<GroupedSettingsResponse> getSettings(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(required = false) String group
    ) {
        Long companyId = extractCompanyId(authHeader);

        List<CompanySetting> settings = group != null && !group.isBlank()
            ? settingsService.getSettingsByGroup(companyId, group)
            : settingsService.getAllSettings(companyId);

        // Agrupamos la lista por el campo "group" usando streams
        // Streams son como bucles funcionales: más compactos que un for clásico
        Map<String, List<SettingResponse>> grouped = settings.stream()
            .map(SettingResponse::from)
            .collect(Collectors.groupingBy(SettingResponse::group));

        return ResponseEntity.ok(new GroupedSettingsResponse(grouped));
    }

    /**
     * POST /api/v1/settings
     * Solo el dueño puede crear nuevos ajustes.
     */
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SettingResponse> createSetting(
        @RequestHeader("Authorization") String authHeader,
        @Valid @RequestBody CreateSettingRequest req
    ) {
        Long companyId = extractCompanyId(authHeader);

        try {
            CompanySetting setting = settingsService.createSetting(
                companyId,
                req.key().toUpperCase().replace(" ", "_"), // normalizamos la clave
                req.value(),
                req.label(),
                req.group()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(SettingResponse.from(setting));
        } catch (RuntimeException e) {
            // La clave ya existe → 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * PUT /api/v1/settings/{id}
     * Actualiza el valor o etiqueta de un ajuste existente.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SettingResponse> updateSetting(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id,
        @Valid @RequestBody UpdateSettingRequest req
    ) {
        Long companyId = extractCompanyId(authHeader);

        try {
            CompanySetting updated = settingsService.updateSetting(
                companyId, id, req.value(), req.label()
            );
            return ResponseEntity.ok(SettingResponse.from(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * DELETE /api/v1/settings/{id}
     * Desactiva un ajuste (eliminación suave).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deactivateSetting(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id
    ) {
        Long companyId = extractCompanyId(authHeader);

        try {
            settingsService.deactivateSetting(companyId, id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private Long extractCompanyId(String authHeader) {
        return jwtUtil.extractCompanyId(authHeader.substring(7));
    }
}
