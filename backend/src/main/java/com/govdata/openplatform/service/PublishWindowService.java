package com.govdata.openplatform.service;

import com.govdata.openplatform.dto.PublishWindowDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PublishWindowService {

    PublishWindowDTO createWindow(PublishWindowDTO windowDTO);

    PublishWindowDTO updateWindow(Long id, PublishWindowDTO windowDTO);

    PublishWindowDTO getWindowById(Long id);

    Page<PublishWindowDTO> getAllWindows(Pageable pageable);

    Page<PublishWindowDTO> getWindowsByStatus(String status, Pageable pageable);

    List<PublishWindowDTO> getActiveWindows();

    List<PublishWindowDTO> getUpcomingWindows();

    PublishWindowDTO activateWindow(Long id);

    PublishWindowDTO closeWindow(Long id);

    PublishWindowDTO cancelWindow(Long id);

    void deleteWindow(Long id);
}
