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
public class PublishWindowDTO {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime windowStart;
    private LocalDateTime windowEnd;
    private String status;
    private String publishType;
    private Integer maxDatasets;
    private Integer publishedCount;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
