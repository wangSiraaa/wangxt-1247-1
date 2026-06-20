package com.govdata.openplatform.repository;

import com.govdata.openplatform.entity.DatasetField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DatasetFieldRepository extends JpaRepository<DatasetField, Long> {

    List<DatasetField> findByDatasetIdOrderBySortOrder(Long datasetId);

    List<DatasetField> findByDatasetIdAndVersion(Long datasetId, String version);

    long countByDatasetIdAndIsSensitiveTrue(Long datasetId);
}
