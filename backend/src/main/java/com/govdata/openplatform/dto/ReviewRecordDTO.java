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
public class ReviewRecordDTO {

    private Long id;
    private Long datasetId;
    private Long versionId;
    private String versionNumber;
    private String reviewType;
    private String reviewStatus;
    private String reviewer;
    private String reviewOpinion;
    private LocalDateTime reviewDate;
    private Integer sensitiveFieldCount;
    private Integer highRiskFieldCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
