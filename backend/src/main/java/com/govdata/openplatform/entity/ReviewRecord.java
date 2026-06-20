package com.govdata.openplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "review_records")
public class ReviewRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "version_number")
    private String versionNumber;

    @Column(name = "review_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReviewType reviewType;

    @Column(name = "review_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus;

    @Column(name = "reviewer")
    private String reviewer;

    @Column(name = "review_opinion", columnDefinition = "TEXT")
    private String reviewOpinion;

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    @Column(name = "sensitive_field_count")
    private Integer sensitiveFieldCount;

    @Column(name = "high_risk_field_count")
    private Integer highRiskFieldCount;

    public enum ReviewType {
        DESENSITIZATION,
        SECURITY,
        LEGAL,
        QUALITY,
        FINAL
    }

    public enum ReviewStatus {
        PENDING,
        IN_PROGRESS,
        APPROVED,
        REJECTED,
        NEEDS_REVISION
    }
}
