package com.soldmate.crm;

import com.soldmate.company.Company;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Contact: persona del CRM de la empresa.
 *
 * Representa cualquier persona relevante para el negocio:
 * empleado, cliente, contacto de proveedor, etc.
 *
 * No confundir con User (quien se autentica en el sistema).
 * Un Contact es un registro de información, no una cuenta de acceso.
 */
@Entity
@Table(name = "contacts")
@Data
@NoArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String email;

    @Column
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    /** Cargo o título del contacto (ej: "Senior UI Designer") */
    @Column
    private String role;

    /** Departamento o equipo (ej: "Design", "Marketing") */
    @Column
    private String department;

    @Column
    private String location;

    /** Progreso de tareas/objetivos actuales (0-100) */
    @Column(nullable = false)
    private Integer progress = 0;

    /** ¿Está activo/disponible actualmente? */
    @Column(nullable = false)
    private Boolean active = true;

    /** Notas internas sobre este contacto */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Fecha de alta legible (ej: "Mar 2022") */
    @Column(name = "join_date")
    private String joinDate;

    /** Valoración interna (1.0 - 5.0) */
    @Column
    private Double rating = 4.0;

    /** Proyectos asociados (CSV o JSON corto) */
    @Column(columnDefinition = "TEXT")
    private String projects;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (progress == null)  progress = 0;
        if (active == null)    active   = true;
        if (rating == null)    rating   = 4.0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
