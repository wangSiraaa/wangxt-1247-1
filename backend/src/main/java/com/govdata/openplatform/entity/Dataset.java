package com.govdata.openplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "datasets")
public class Dataset extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "department")
    private String department;

    @Column(name = "data_source")
    private String dataSource;

    @Column(name = "update_frequency")
    private String updateFrequency;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private DatasetStatus status;

    @Column(name = "current_version")
    private String currentVersion;

    @Column(name = "published_version")
    private String publishedVersion;

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DatasetField> fields = new ArrayList<>();

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DatasetVersion> versions = new ArrayList<>();

    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewRecord> reviewRecords = new ArrayList<>();

    public enum DatasetStatus {
        DRAFT,
        SUBMITTED,
        UNDER_REVIEW,
        REVIEW_APPROVED,
        REVIEW_REJECTED,
        PUBLISHED,
        ARCHIVED
    }
}
