package com.govdata.openplatform.service.impl;

import com.govdata.openplatform.dto.ReviewRecordDTO;
import com.govdata.openplatform.entity.Dataset;
import com.govdata.openplatform.entity.DatasetVersion;
import com.govdata.openplatform.entity.ReviewRecord;
import com.govdata.openplatform.repository.DatasetRepository;
import com.govdata.openplatform.repository.DatasetVersionRepository;
import com.govdata.openplatform.repository.ReviewRecordRepository;
import com.govdata.openplatform.repository.VersionFieldRepository;
import com.govdata.openplatform.service.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRecordRepository reviewRepository;
    private final DatasetRepository datasetRepository;
    private final DatasetVersionRepository versionRepository;
    private final VersionFieldRepository versionFieldRepository;

    @Override
    @Transactional
    public ReviewRecordDTO createReviewRecord(ReviewRecordDTO reviewDTO) {
        Dataset dataset = datasetRepository.findById(reviewDTO.getDatasetId())
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + reviewDTO.getDatasetId()));

        ReviewRecord record = new ReviewRecord();
        record.setDataset(dataset);
        record.setVersionId(reviewDTO.getVersionId());
        record.setVersionNumber(reviewDTO.getVersionNumber());
        record.setReviewType(ReviewRecord.ReviewType.valueOf(reviewDTO.getReviewType()));
        record.setReviewStatus(ReviewRecord.ReviewStatus.PENDING);
        record.setReviewer(reviewDTO.getReviewer());
        record.setReviewOpinion(reviewDTO.getReviewOpinion());

        ReviewRecord saved = reviewRepository.save(record);
        return toDTO(saved);
    }

    @Override
    public ReviewRecordDTO getReviewRecordById(Long id) {
        ReviewRecord record = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review record not found: " + id));
        return toDTO(record);
    }

    @Override
    public List<ReviewRecordDTO> getReviewRecordsByDatasetId(Long datasetId) {
        return reviewRepository.findByDatasetIdOrderByCreatedAtDesc(datasetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ReviewRecordDTO> getReviewRecordsByStatus(String status, Pageable pageable) {
        ReviewRecord.ReviewStatus reviewStatus = ReviewRecord.ReviewStatus.valueOf(status);
        return reviewRepository.findByReviewStatus(reviewStatus, pageable).map(this::toDTO);
    }

    @Override
    public Page<ReviewRecordDTO> getReviewRecordsByReviewer(String reviewer, Pageable pageable) {
        return reviewRepository.findByReviewer(reviewer, pageable).map(this::toDTO);
    }

    @Override
    @Transactional
    public ReviewRecordDTO updateReviewStatus(Long id, String status, String opinion, String reviewer) {
        ReviewRecord record = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review record not found: " + id));

        record.setReviewStatus(ReviewRecord.ReviewStatus.valueOf(status));
        record.setReviewOpinion(opinion);
        record.setReviewer(reviewer);
        record.setReviewDate(LocalDateTime.now());

        ReviewRecord saved = reviewRepository.save(record);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public ReviewRecordDTO startDesensitizationReview(Long versionId) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));

        if (version.getStatus() != DatasetVersion.VersionStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted versions can start review");
        }

        long sensitiveCount = versionFieldRepository.countByVersionIdAndIsSensitiveTrue(versionId);
        long highRiskCount = versionFieldRepository.findByVersionIdOrderBySortOrder(versionId).stream()
                .filter(f -> f.getSensitivityLevel() != null
                        && (f.getSensitivityLevel() == DatasetField.SensitivityLevel.HIGH
                        || f.getSensitivityLevel() == DatasetField.SensitivityLevel.CRITICAL))
                .count();

        ReviewRecord record = new ReviewRecord();
        record.setDataset(version.getDataset());
        record.setVersionId(versionId);
        record.setVersionNumber(version.getVersionNumber());
        record.setReviewType(ReviewRecord.ReviewType.DESENSITIZATION);
        record.setReviewStatus(ReviewRecord.ReviewStatus.IN_PROGRESS);
        record.setSensitiveFieldCount((int) sensitiveCount);
        record.setHighRiskFieldCount((int) highRiskCount);

        version.setStatus(DatasetVersion.VersionStatus.UNDER_REVIEW);
        versionRepository.save(version);

        Dataset dataset = version.getDataset();
        dataset.setStatus(Dataset.DatasetStatus.UNDER_REVIEW);
        datasetRepository.save(dataset);

        ReviewRecord saved = reviewRepository.save(record);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public ReviewRecordDTO approveDesensitizationReview(Long reviewId, String reviewer, String opinion) {
        ReviewRecord record = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review record not found: " + reviewId));

        if (record.getReviewStatus() == ReviewRecord.ReviewStatus.APPROVED) {
            throw new IllegalStateException("Review is already approved");
        }

        record.setReviewStatus(ReviewRecord.ReviewStatus.APPROVED);
        record.setReviewer(reviewer);
        record.setReviewOpinion(opinion);
        record.setReviewDate(LocalDateTime.now());

        reviewRepository.save(record);

        if (record.getVersionId() != null) {
            DatasetVersion version = versionRepository.findById(record.getVersionId()).orElseThrow();
            version.setStatus(DatasetVersion.VersionStatus.REVIEW_APPROVED);
            versionRepository.save(version);

            Dataset dataset = version.getDataset();
            dataset.setStatus(Dataset.DatasetStatus.REVIEW_APPROVED);
            datasetRepository.save(dataset);
        }

        return toDTO(record);
    }

    @Override
    @Transactional
    public ReviewRecordDTO rejectDesensitizationReview(Long reviewId, String reviewer, String opinion) {
        ReviewRecord record = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review record not found: " + reviewId));

        record.setReviewStatus(ReviewRecord.ReviewStatus.REJECTED);
        record.setReviewer(reviewer);
        record.setReviewOpinion(opinion);
        record.setReviewDate(LocalDateTime.now());

        reviewRepository.save(record);

        if (record.getVersionId() != null) {
            DatasetVersion version = versionRepository.findById(record.getVersionId()).orElseThrow();
            version.setStatus(DatasetVersion.VersionStatus.REVIEW_REJECTED);
            versionRepository.save(version);

            Dataset dataset = version.getDataset();
            dataset.setStatus(Dataset.DatasetStatus.REVIEW_REJECTED);
            datasetRepository.save(dataset);
        }

        return toDTO(record);
    }

    @Override
    @Transactional
    public ReviewRecordDTO requestRevision(Long reviewId, String reviewer, String opinion) {
        ReviewRecord record = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("Review record not found: " + reviewId));

        record.setReviewStatus(ReviewRecord.ReviewStatus.NEEDS_REVISION);
        record.setReviewer(reviewer);
        record.setReviewOpinion(opinion);
        record.setReviewDate(LocalDateTime.now());

        reviewRepository.save(record);

        if (record.getVersionId() != null) {
            DatasetVersion version = versionRepository.findById(record.getVersionId()).orElseThrow();
            version.setStatus(DatasetVersion.VersionStatus.DRAFT);
            versionRepository.save(version);

            Dataset dataset = version.getDataset();
            dataset.setStatus(Dataset.DatasetStatus.DRAFT);
            datasetRepository.save(dataset);
        }

        return toDTO(record);
    }

    private ReviewRecordDTO toDTO(ReviewRecord record) {
        return ReviewRecordDTO.builder()
                .id(record.getId())
                .datasetId(record.getDataset().getId())
                .versionId(record.getVersionId())
                .versionNumber(record.getVersionNumber())
                .reviewType(record.getReviewType().name())
                .reviewStatus(record.getReviewStatus().name())
                .reviewer(record.getReviewer())
                .reviewOpinion(record.getReviewOpinion())
                .reviewDate(record.getReviewDate())
                .sensitiveFieldCount(record.getSensitiveFieldCount())
                .highRiskFieldCount(record.getHighRiskFieldCount())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
