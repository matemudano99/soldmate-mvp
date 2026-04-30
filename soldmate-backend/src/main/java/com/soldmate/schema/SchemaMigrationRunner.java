package com.soldmate.schema;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Versionador de esquema propio (sin Flyway).
 *
 * Regla:
 * - Cada paso lleva una "version" única.
 * - Si ya está registrada en schema_version, no vuelve a ejecutar.
 * - Las migraciones deben ser idempotentes.
 */
@Component
@Order(10)
public class SchemaMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrationRunner.class);

    private final SchemaVersionRepository schemaVersionRepository;
    private final JdbcTemplate jdbcTemplate;

    public SchemaMigrationRunner(SchemaVersionRepository schemaVersionRepository,
                                 JdbcTemplate jdbcTemplate) {
        this.schemaVersionRepository = schemaVersionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<MigrationStep> steps = List.of(
            new MigrationStep("001", "Initialize schema versioning table", this::initialize),
            new MigrationStep("002", "Add performance indexes for core ERP queries", this::addPerformanceIndexes),
            new MigrationStep("003", "Add data integrity constraints for core tables", this::addDataIntegrityConstraints)
        );

        for (MigrationStep step : steps) {
            if (schemaVersionRepository.existsByVersion(step.version())) {
                continue;
            }

            log.info("Applying schema step {} - {}", step.version(), step.description());
            try {
                step.action().run();

                SchemaVersion version = new SchemaVersion();
                version.setVersion(step.version());
                version.setDescription(step.description());
                version.setAppliedAt(Instant.now());
                schemaVersionRepository.save(version);
            } catch (Exception e) {
                log.warn("Schema step {} skipped (insufficient privileges or already applied): {}", step.version(), e.getMessage());
            }
        }
    }

    private void initialize() {
        // Paso base para dejar registrada la infraestructura del versionador.
        // Los próximos cambios se añaden como nuevos MigrationStep.
    }

    private void addPerformanceIndexes() {
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_products_company_id ON products (company_id)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_suppliers_company_active ON suppliers (company_id, active)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_suppliers_company_category_active ON suppliers (company_id, category, active)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_incidents_company_created_at ON incidents (company_id, created_at DESC)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_incidents_company_status_created_at ON incidents (company_id, status, created_at DESC)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_company_settings_company_active ON company_settings (company_id, active)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_company_settings_company_group_active ON company_settings (company_id, setting_group, active)");
    }

    private void addDataIntegrityConstraints() {
        // products
        addConstraintIfMissing(
            "products_name_not_blank_chk",
            "ALTER TABLE products ADD CONSTRAINT products_name_not_blank_chk CHECK (length(trim(name)) > 0) NOT VALID"
        );
        addConstraintIfMissing(
            "products_current_stock_non_negative_chk",
            "ALTER TABLE products ADD CONSTRAINT products_current_stock_non_negative_chk CHECK (current_stock >= 0) NOT VALID"
        );
        addConstraintIfMissing(
            "products_min_stock_non_negative_chk",
            "ALTER TABLE products ADD CONSTRAINT products_min_stock_non_negative_chk CHECK (min_stock >= 0) NOT VALID"
        );
        addConstraintIfMissing(
            "products_vat_rate_range_chk",
            "ALTER TABLE products ADD CONSTRAINT products_vat_rate_range_chk CHECK (vat_rate >= 0 AND vat_rate <= 100) NOT VALID"
        );

        // suppliers
        addConstraintIfMissing(
            "suppliers_name_not_blank_chk",
            "ALTER TABLE suppliers ADD CONSTRAINT suppliers_name_not_blank_chk CHECK (length(trim(name)) > 0) NOT VALID"
        );

        // incidents
        addConstraintIfMissing(
            "incidents_title_not_blank_chk",
            "ALTER TABLE incidents ADD CONSTRAINT incidents_title_not_blank_chk CHECK (length(trim(title)) > 0) NOT VALID"
        );

        // company_settings
        addConstraintIfMissing(
            "company_settings_key_not_blank_chk",
            "ALTER TABLE company_settings ADD CONSTRAINT company_settings_key_not_blank_chk CHECK (length(trim(setting_key)) > 0) NOT VALID"
        );
        addConstraintIfMissing(
            "company_settings_value_not_blank_chk",
            "ALTER TABLE company_settings ADD CONSTRAINT company_settings_value_not_blank_chk CHECK (length(trim(value)) > 0) NOT VALID"
        );
        addConstraintIfMissing(
            "company_settings_group_not_blank_chk",
            "ALTER TABLE company_settings ADD CONSTRAINT company_settings_group_not_blank_chk CHECK (length(trim(setting_group)) > 0) NOT VALID"
        );
    }

    private void addConstraintIfMissing(String constraintName, String addConstraintSql) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT count(*) FROM pg_constraint WHERE conname = ?",
            Integer.class,
            constraintName
        );
        if (count != null && count > 0) {
            return;
        }
        jdbcTemplate.execute(addConstraintSql);
    }

    private record MigrationStep(String version, String description, Runnable action) {
    }
}

