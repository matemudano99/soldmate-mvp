package com.soldmate.schema;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SchemaVersionRepository extends JpaRepository<SchemaVersion, Long> {
    boolean existsByVersion(String version);
}

