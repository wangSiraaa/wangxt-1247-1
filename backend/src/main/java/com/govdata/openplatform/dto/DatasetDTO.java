package com.govdata.openplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetDTO {

    private Long id;
    private String name;
    private String code;
    private String description;
    private String category;
    private String department;
    private String dataSource;
    private String updateFrequency;
    private String status;
    private String currentVersion;
    private String publishedVersion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;

    private List<DatasetFieldDTO> fields;
    private List<DatasetVersionDTO> versions;
}
