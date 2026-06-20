package com.govdata.openplatform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "version_fields")
public class VersionField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = false)
    private DatasetVersion version;

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
    private DatasetField.SensitivityLevel sensitivityLevel;

    @Column(name = "desensitization_type")
    @Enumerated(EnumType.STRING)
    private DatasetField.DesensitizationType desensitizationType;

    @Column(name = "desensitization_rule", columnDefinition = "TEXT")
    private String desensitizationRule;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_new", nullable = false)
    private Boolean isNew = false;

    @Column(name = "is_modified", nullable = false)
    private Boolean isModified = false;
}
