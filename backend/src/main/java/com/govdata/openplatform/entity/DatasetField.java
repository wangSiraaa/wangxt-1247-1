package com.govdata.openplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "dataset_fields")
public class DatasetField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @Column(name = "version")
    private String version;

    @Column(name = "field_name", nullable = false)
    private String fieldName;

    @Column(name = "field_code", nullable = false)
    private String fieldCode;

    @Column(name = "data_type", nullable = false)
    private String dataType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sample_data")
    private String sampleData;

    @Column(name = "is_sensitive", nullable = false)
    private Boolean isSensitive = false;

    @Column(name = "sensitivity_level")
    @Enumerated(EnumType.STRING)
    private SensitivityLevel sensitivityLevel;

    @Column(name = "desensitization_type")
    @Enumerated(EnumType.STRING)
    private DesensitizationType desensitizationType;

    @Column(name = "desensitization_rule", columnDefinition = "TEXT")
    private String desensitizationRule;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public enum SensitivityLevel {
        NONE,
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum DesensitizationType {
        NONE,
        MASKING,
        HASHING,
        ENCRYPTION,
        REPLACEMENT,
        AGGREGATION,
        CUSTOM
    }
}
