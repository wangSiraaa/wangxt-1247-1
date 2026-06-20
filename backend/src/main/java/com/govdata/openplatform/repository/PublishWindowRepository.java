package com.govdata.openplatform.repository;

import com.govdata.openplatform.entity.PublishWindow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PublishWindowRepository extends JpaRepository<PublishWindow, Long> {

    Page<PublishWindow> findByStatus(PublishWindow.WindowStatus status, Pageable pageable);

    @Query("SELECT w FROM PublishWindow w WHERE w.status = 'ACTIVE' AND :now BETWEEN w.windowStart AND w.windowEnd")
    List<PublishWindow> findActiveWindows(LocalDateTime now);

    @Query("SELECT w FROM PublishWindow w WHERE w.windowStart > :now ORDER BY w.windowStart ASC")
    List<PublishWindow> findUpcomingWindows(LocalDateTime now);

    Optional<PublishWindow> findByStatusAndId(PublishWindow.WindowStatus status, Long id);
}
