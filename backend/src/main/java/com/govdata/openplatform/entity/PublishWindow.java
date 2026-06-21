package com.govdata.openplatform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "publish_windows")
public class PublishWindow extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "window_start", nullable = false)
    private LocalDateTime windowStart;

    @Column(name = "window_end", nullable = false)
    private LocalDateTime windowEnd;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private WindowStatus status;

    @Column(name = "publish_type")
    @Enumerated(EnumType.STRING)
    private PublishType publishType;

    @Column(name = "max_datasets")
    private Integer maxDatasets;

    @Column(name = "published_count")
    private Integer publishedCount = 0;

    public enum WindowStatus {
        PLANNED,
        ACTIVE,
        CLOSED,
        CANCELLED
    }

    public enum PublishType {
        ROUTINE,
        EMERGENCY,
        SPECIAL
    }
}
