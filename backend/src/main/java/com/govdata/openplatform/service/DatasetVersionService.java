package com.govdata.openplatform.service;

import com.govdata.openplatform.dto.DatasetVersionDTO;
import com.govdata.openplatform.dto.DatasetFieldDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DatasetVersionService {

    DatasetVersionDTO createVersion(Long datasetId, DatasetVersionDTO versionDTO);

    DatasetVersionDTO getVersionById(Long versionId);

    List<DatasetVersionDTO> getVersionsByDatasetId(Long datasetId);

    List<DatasetVersionDTO> getPublishedVersions(Long datasetId);

    Page<DatasetVersionDTO> getVersionsByStatus(Long datasetId, String status, Pageable pageable);

    DatasetVersionDTO updateVersion(Long versionId, DatasetVersionDTO versionDTO);

    DatasetVersionDTO submitForReview(Long versionId);

    DatasetVersionDTO publishVersion(Long versionId, Long publishWindowId);

    DatasetVersionDTO archiveVersion(Long versionId);

    List<DatasetFieldDTO> getVersionFields(Long versionId);

    List<DatasetFieldDTO> saveVersionFields(Long versionId, List<DatasetFieldDTO> fields);
}
