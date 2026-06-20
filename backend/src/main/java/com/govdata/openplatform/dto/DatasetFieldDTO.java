package com.govdata.openplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetFieldDTO {

    private Long id;
    private String fieldName;
    private String fieldCode;
    private String dataType;
    private String description;
    private String sampleData;
    private Boolean isSensitive;
    private String sensitivityLevel;
    private String desensitizationType;
    private String desensitizationRule;
    private Integer sortOrder;
    private Boolean isNew;
    private Boolean isModified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
