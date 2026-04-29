package com.soldmate.company;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CompanySettings: configuración personalizable de cada empresa.
 *
 * En lugar de tener los tipos de IVA, categorías o estados de pedido
 * "hardcodeados" en el código, los guardamos aquí.
 * Así cada restaurante puede tener su propia configuración.
 *
 * Usamos un patrón clave-valor (key/value) muy habitual en ERPs:
 *   - Es flexible: puedes añadir nuevas opciones sin cambiar la base de datos
 *   - Es sencillo de entender: cada fila es un "ajuste" de la empresa
 *
 * Ejemplos de filas en la tabla:
 *   company_id | key            | value  | group
 *   1          | VAT_FOOD       | 10.00  | VAT
 *   1          | VAT_ALCOHOL    | 21.00  | VAT
 *   1          | VAT_TAKEAWAY   | 10.00  | VAT
 *   1          | CAT_DRINKS     | Bebidas| CATEGORY
 *   1          | ORDER_STATUS_1 | Recibido| ORDER_STATUS
 */
@Entity
@Table(
    name = "company_settings",
    // Garantiza que no haya dos ajustes con la misma clave para la misma empresa
    uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "setting_key"})
)
@Data
@NoArgsConstructor
public class CompanySetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // La empresa a la que pertenece este ajuste
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // Clave del ajuste (ej: "VAT_FOOD", "CAT_DRINKS")
    // Usamos setting_key en la BD porque "key" es palabra reservada en SQL
    @Column(name = "setting_key", nullable = false)
    private String key;

    // Valor del ajuste (ej: "10.00", "Bebidas", "Recibido")
    @Column(nullable = false)
    private String value;

    // Etiqueta legible para mostrar en la UI (ej: "IVA alimentación")
    private String label;

    // Grupo para agrupar ajustes en la UI (VAT, CATEGORY, ORDER_STATUS).
    // "group" es palabra reservada en SQL, por eso usamos setting_group.
    @Column(name = "setting_group", nullable = false)
    private String group;

    // Orden de visualización dentro del grupo
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // Si el ajuste está activo o fue eliminado "suavemente"
    @Column(nullable = false)
    private boolean active = true;

    // Constructor de conveniencia para crear ajustes fácilmente
    public CompanySetting(Company company, String key, String value,
                          String label, String group) {
        this.company = company;
        this.key     = key;
        this.value   = value;
        this.label   = label;
        this.group   = group;
    }
}
