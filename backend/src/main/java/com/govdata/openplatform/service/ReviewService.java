package com.govdata.openplatform.service;

import com.govdata.openplatform.dto.ReviewRecordDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    ReviewRecordDTO createReviewRecord(ReviewRecordDTO reviewDTO);

    ReviewRecordDTO getReviewRecordById(Long id);

    List<ReviewRecordDTO> getReviewRecordsByDatasetId(Long datasetId);

    Page<ReviewRecordDTO> getReviewRecordsByStatus(String status, Pageable pageable);

    Page<ReviewRecordDTO> getReviewRecordsByReviewer(String reviewer, Pageable pageable);

    ReviewRecordDTO updateReviewStatus(Long id, String status, String opinion, String reviewer);

    ReviewRecordDTO startDesensitizationReview(Long versionId);

    ReviewRecordDTO approveDesensitizationReview(Long reviewId, String reviewer, String opinion);

    ReviewRecordDTO rejectDesensitizationReview(Long reviewId, String reviewer, String opinion);

    ReviewRecordDTO requestRevision(Long reviewId, String reviewer, String opinion);
}
