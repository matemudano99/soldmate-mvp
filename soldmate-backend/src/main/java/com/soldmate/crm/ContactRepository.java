package com.soldmate.crm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    /** Todos los contactos de una empresa, ordenados por nombre. */
    List<Contact> findByCompanyIdOrderByFullNameAsc(Long companyId);

    /** Busca contacto por empresa + id (para verificar pertenencia antes de operar). */
    Optional<Contact> findByIdAndCompanyId(Long id, Long companyId);

    /** ¿Existe ya un contacto con ese email en la empresa? */
    boolean existsByEmailAndCompanyId(String email, Long companyId);

    /** Total de contactos por empresa. */
    long countByCompanyId(Long companyId);

    /** Contactos activos de la empresa. */
    List<Contact> findByCompanyIdAndActiveTrue(Long companyId);
}
