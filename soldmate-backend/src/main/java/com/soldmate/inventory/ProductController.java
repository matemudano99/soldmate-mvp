package com.soldmate.inventory;

import com.soldmate.auth.JwtUtil;
import com.soldmate.company.Company;
import com.soldmate.company.CompanyRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class ProductController {

    private final ProductRepository productRepository;
    private final CompanyRepository companyRepository;
    private final JwtUtil jwtUtil;

    public ProductController(ProductRepository productRepository,
                             CompanyRepository companyRepository,
                             JwtUtil jwtUtil) {
        this.productRepository = productRepository;
        this.companyRepository = companyRepository;
        this.jwtUtil = jwtUtil;
    }

    public record ProductResponse(
        Long id,
        String name,
        BigDecimal currentStock,
        BigDecimal minStock,
        String unit,
        String category,
        BigDecimal vatRate,
        boolean lowStock
    ) {
        public static ProductResponse from(Product p) {
            return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getCurrentStock(),
                p.getMinStock(),
                p.getUnit().name(),
                p.getCategory(),
                p.getVatRate(),
                p.isLowStock()
            );
        }
    }

    public record CreateProductRequest(
        @NotBlank String name,
        @NotNull BigDecimal currentStock,
        @NotNull BigDecimal minStock,
        @NotNull Product.Unit unit,
        String category,
        BigDecimal vatRate
    ) {}

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
        @RequestHeader("Authorization") String authHeader
    ) {
        Long companyId = extractCompanyId(authHeader);
        List<ProductResponse> response = productRepository.findByCompanyId(companyId)
            .stream()
            .map(ProductResponse::from)
            .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProductResponse> createProduct(
        @RequestHeader("Authorization") String authHeader,
        @Valid @RequestBody CreateProductRequest req
    ) {
        Long companyId = extractCompanyId(authHeader);
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        Product product = new Product();
        product.setName(req.name().trim());
        product.setCurrentStock(req.currentStock());
        product.setMinStock(req.minStock());
        product.setUnit(req.unit());
        product.setCategory(req.category());
        product.setVatRate(req.vatRate() != null ? req.vatRate() : new BigDecimal("10.00"));
        product.setCompany(company);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ProductResponse.from(productRepository.save(product)));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> updateStock(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long id,
        @RequestParam BigDecimal quantity
    ) {
        Long companyId = extractCompanyId(authHeader);
        Product product = productRepository.findByIdAndCompanyId(id, companyId).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        product.setCurrentStock(product.getCurrentStock().add(quantity));
        return ResponseEntity.ok(ProductResponse.from(productRepository.save(product)));
    }

    private Long extractCompanyId(String authHeader) {
        return jwtUtil.extractCompanyId(authHeader.substring(7));
    }
}
