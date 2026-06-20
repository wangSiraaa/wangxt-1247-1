package com.govdata.openplatform.repository;

import com.govdata.openplatform.entity.DatasetVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetVersionRepository extends JpaRepository<DatasetVersion, Long> {

    List<DatasetVersion> findByDatasetIdOrderByCreatedAtDesc(Long datasetId);

    Optional<DatasetVersion> findByDatasetIdAndVersionNumber(Long datasetId, String versionNumber);

    @Query("SELECT v FROM DatasetVersion v WHERE v.dataset.id = :datasetId AND v.isPublished = true ORDER BY v.publishedAt DESC")
    List<DatasetVersion> findPublishedVersionsByDatasetId(Long datasetId);

    @Query("SELECT v FROM DatasetVersion v WHERE v.dataset.id = :datasetId AND v.status = :status")
    Page<DatasetVersion> findByDatasetIdAndStatus(Long datasetId, DatasetVersion.VersionStatus status, Pageable pageable);

    Optional<DatasetVersion> findFirstByDatasetIdOrderByVersionNumberDesc(Long datasetId);
}
