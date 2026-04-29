package com.soldmate.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * SupplierRepository: acceso a la tabla suppliers.
 * Todos los métodos filtran por companyId para el aislamiento multi-tenant.
 */
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    List<Supplier>     findByCompanyIdAndActiveTrue(Long companyId);
    List<Supplier>     findByCompanyIdAndCategoryAndActiveTrue(Long companyId, String category);
    Optional<Supplier> findByIdAndCompanyId(Long id, Long companyId);
    Optional<Supplier> findByCompanyIdAndNameIgnoreCase(Long companyId, String name);
}
