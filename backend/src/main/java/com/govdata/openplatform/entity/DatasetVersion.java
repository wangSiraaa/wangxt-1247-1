package com.govdata.openplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "dataset_versions")
public class DatasetVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @Column(name = "version_number", nullable = false)
    private String versionNumber;

    @Column(name = "version_name")
    private String versionName;

    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private VersionStatus status;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "publish_window_id")
    private Long publishWindowId;

    @Column(name = "field_count")
    private Integer fieldCount;

    @Column(name = "record_count")
    private Long recordCount;

    @Column(name = "data_size_bytes")
    private Long dataSizeBytes;

    @OneToMany(mappedBy = "version", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VersionField> fields = new ArrayList<>();

    public enum VersionStatus {
        DRAFT,
        SUBMITTED,
        UNDER_REVIEW,
        REVIEW_APPROVED,
        REVIEW_REJECTED,
        PUBLISHED,
        ARCHIVED
    }
}
