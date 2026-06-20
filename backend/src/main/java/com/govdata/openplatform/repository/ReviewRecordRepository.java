package com.govdata.openplatform.repository;

import com.govdata.openplatform.entity.ReviewRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRecordRepository extends JpaRepository<ReviewRecord, Long> {

    List<ReviewRecord> findByDatasetIdOrderByCreatedAtDesc(Long datasetId);

    List<ReviewRecord> findByDatasetIdAndReviewType(Long datasetId, ReviewRecord.ReviewType reviewType);

    Page<ReviewRecord> findByReviewStatus(ReviewRecord.ReviewStatus status, Pageable pageable);

    Page<ReviewRecord> findByReviewer(String reviewer, Pageable pageable);
}
