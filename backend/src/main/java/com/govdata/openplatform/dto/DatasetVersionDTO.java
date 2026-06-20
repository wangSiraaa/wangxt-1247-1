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
public class DatasetVersionDTO {

    private Long id;
    private String versionNumber;
    private String versionName;
    private String changeDescription;
    private String status;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private Long publishWindowId;
    private Integer fieldCount;
    private Long recordCount;
    private Long dataSizeBytes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;

    private List<DatasetFieldDTO> fields;
    private List<ReviewRecordDTO> reviewRecords;
}
