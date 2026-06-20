package com.govdata.openplatform.repository;

import com.govdata.openplatform.entity.Dataset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {

    Optional<Dataset> findByCode(String code);

    List<Dataset> findByDepartment(String department);

    Page<Dataset> findByStatus(Dataset.DatasetStatus status, Pageable pageable);

    @Query("SELECT d FROM Dataset d WHERE d.status = 'PUBLISHED'")
    Page<Dataset> findPublishedDatasets(Pageable pageable);

    @Query("SELECT d FROM Dataset d WHERE d.status = 'PUBLISHED' AND " +
           "(d.name LIKE %:keyword% OR d.code LIKE %:keyword% OR d.description LIKE %:keyword%)")
    Page<Dataset> searchPublishedDatasets(String keyword, Pageable pageable);

    Page<Dataset> findByStatusIn(List<Dataset.DatasetStatus> statuses, Pageable pageable);

    long countByStatus(Dataset.DatasetStatus status);
}
