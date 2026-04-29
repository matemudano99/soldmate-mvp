package com.soldmate.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA genera el SQL a partir del nombre del método:
 *   findByCompanyId → SELECT * FROM products WHERE company_id = ?
 *   findByIdAndCompanyId → ... WHERE id = ? AND company_id = ?
 *
 * El segundo método es el aislamiento multi-tenant:
 * aunque alguien manipule el id, si no pertenece a su empresa → Optional.empty()
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCompanyId(Long companyId);
    Optional<Product> findByIdAndCompanyId(Long id, Long companyId);
    Optional<Product> findByCompanyIdAndNameIgnoreCase(Long companyId, String name);
}
