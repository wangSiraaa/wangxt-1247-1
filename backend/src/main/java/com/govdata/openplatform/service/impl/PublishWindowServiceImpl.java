package com.govdata.openplatform.service.impl;

import com.govdata.openplatform.dto.PublishWindowDTO;
import com.govdata.openplatform.entity.PublishWindow;
import com.govdata.openplatform.repository.PublishWindowRepository;
import com.govdata.openplatform.service.PublishWindowService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublishWindowServiceImpl implements PublishWindowService {

    private final PublishWindowRepository windowRepository;

    @Override
    @Transactional
    public PublishWindowDTO createWindow(PublishWindowDTO windowDTO) {
        PublishWindow window = new PublishWindow();
        window.setTitle(windowDTO.getTitle());
        window.setDescription(windowDTO.getDescription());
        window.setWindowStart(windowDTO.getWindowStart());
        window.setWindowEnd(windowDTO.getWindowEnd());
        window.setStatus(PublishWindow.WindowStatus.PLANNED);
        window.setPublishType(windowDTO.getPublishType() != null ?
                PublishWindow.PublishType.valueOf(windowDTO.getPublishType()) :
                PublishWindow.PublishType.ROUTINE);
        window.setMaxDatasets(windowDTO.getMaxDatasets());
        window.setPublishedCount(0);

        PublishWindow saved = windowRepository.save(window);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public PublishWindowDTO updateWindow(Long id, PublishWindowDTO windowDTO) {
        PublishWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + id));

        if (window.getStatus() == PublishWindow.WindowStatus.ACTIVE ||
                window.getStatus() == PublishWindow.WindowStatus.CLOSED) {
            throw new IllegalStateException("Cannot modify active or closed windows");
        }

        window.setTitle(windowDTO.getTitle());
        window.setDescription(windowDTO.getDescription());
        window.setWindowStart(windowDTO.getWindowStart());
        window.setWindowEnd(windowDTO.getWindowEnd());
        if (windowDTO.getPublishType() != null) {
            window.setPublishType(PublishWindow.PublishType.valueOf(windowDTO.getPublishType()));
        }
        window.setMaxDatasets(windowDTO.getMaxDatasets());

        PublishWindow saved = windowRepository.save(window);
        return toDTO(saved);
    }

    @Override
    public PublishWindowDTO getWindowById(Long id) {
        PublishWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + id));
        return toDTO(window);
    }

    @Override
    public Page<PublishWindowDTO> getAllWindows(Pageable pageable) {
        return windowRepository.findAll(pageable).map(this::toDTO);
    }

    @Override
    public Page<PublishWindowDTO> getWindowsByStatus(String status, Pageable pageable) {
        PublishWindow.WindowStatus windowStatus = PublishWindow.WindowStatus.valueOf(status);
        return windowRepository.findByStatus(windowStatus, pageable).map(this::toDTO);
    }

    @Override
    public List<PublishWindowDTO> getActiveWindows() {
        return windowRepository.findActiveWindows(LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PublishWindowDTO> getUpcomingWindows() {
        return windowRepository.findUpcomingWindows(LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PublishWindowDTO activateWindow(Long id) {
        PublishWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + id));

        if (window.getStatus() != PublishWindow.WindowStatus.PLANNED) {
            throw new IllegalStateException("Only planned windows can be activated");
        }

        window.setStatus(PublishWindow.WindowStatus.ACTIVE);
        PublishWindow saved = windowRepository.save(window);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public PublishWindowDTO closeWindow(Long id) {
        PublishWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + id));

        if (window.getStatus() != PublishWindow.WindowStatus.ACTIVE) {
            throw new IllegalStateException("Only active windows can be closed");
        }

        window.setStatus(PublishWindow.WindowStatus.CLOSED);
        PublishWindow saved = windowRepository.save(window);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public PublishWindowDTO cancelWindow(Long id) {
        PublishWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + id));

        if (window.getStatus() == PublishWindow.WindowStatus.CLOSED) {
            throw new IllegalStateException("Closed windows cannot be cancelled");
        }

        window.setStatus(PublishWindow.WindowStatus.CANCELLED);
        PublishWindow saved = windowRepository.save(window);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteWindow(Long id) {
        PublishWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + id));

        if (window.getStatus() == PublishWindow.WindowStatus.ACTIVE) {
            throw new IllegalStateException("Cannot delete active windows");
        }

        windowRepository.deleteById(id);
    }

    private PublishWindowDTO toDTO(PublishWindow window) {
        return PublishWindowDTO.builder()
                .id(window.getId())
                .title(window.getTitle())
                .description(window.getDescription())
                .windowStart(window.getWindowStart())
                .windowEnd(window.getWindowEnd())
                .status(window.getStatus() != null ? window.getStatus().name() : null)
                .publishType(window.getPublishType() != null ? window.getPublishType().name() : null)
                .maxDatasets(window.getMaxDatasets())
                .publishedCount(window.getPublishedCount())
                .createdAt(window.getCreatedAt())
                .updatedAt(window.getUpdatedAt())
                .build();
    }
}
