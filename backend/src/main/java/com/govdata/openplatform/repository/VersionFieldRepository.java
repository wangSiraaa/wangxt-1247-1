package com.govdata.openplatform.repository;

import com.govdata.openplatform.entity.VersionField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VersionFieldRepository extends JpaRepository<VersionField, Long> {

    List<VersionField> findByVersionIdOrderBySortOrder(Long versionId);

    long countByVersionIdAndIsSensitiveTrue(Long versionId);
}
