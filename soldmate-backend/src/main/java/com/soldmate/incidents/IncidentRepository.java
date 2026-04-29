package com.soldmate.incidents;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Incident> findByCompanyIdAndStatusOrderByCreatedAtDesc(
        Long companyId, Incident.Status status);

    Optional<Incident> findByIdAndCompanyId(Long id, Long companyId);
    boolean existsByCompanyId(Long companyId);

    @Query("SELECT COUNT(i) FROM Incident i " +
           "WHERE i.company.id = :companyId " +
           "AND i.status <> com.soldmate.incidents.Incident.Status.CLOSED")
    long countActiveByCompanyId(Long companyId);
}
