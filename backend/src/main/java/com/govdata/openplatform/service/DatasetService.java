package com.govdata.openplatform.service;

import com.govdata.openplatform.dto.DatasetDTO;
import com.govdata.openplatform.dto.DatasetFieldDTO;
import com.govdata.openplatform.entity.Dataset;
import com.govdata.openplatform.entity.DatasetField;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DatasetService {

    DatasetDTO createDataset(DatasetDTO datasetDTO);

    DatasetDTO updateDataset(Long id, DatasetDTO datasetDTO);

    DatasetDTO getDatasetById(Long id);

    DatasetDTO getDatasetByCode(String code);

    Page<DatasetDTO> getAllDatasets(Pageable pageable);

    Page<DatasetDTO> getDatasetsByStatus(String status, Pageable pageable);

    Page<DatasetDTO> getPublishedDatasets(String keyword, Pageable pageable);

    void deleteDataset(Long id);

    DatasetDTO submitForReview(Long id);

    DatasetDTO updateStatus(Long id, Dataset.DatasetStatus status);

    List<DatasetFieldDTO> getDatasetFields(Long datasetId);

    DatasetFieldDTO addField(Long datasetId, DatasetFieldDTO fieldDTO);

    DatasetFieldDTO updateField(Long fieldId, DatasetFieldDTO fieldDTO);

    void deleteField(Long fieldId);

    List<DatasetFieldDTO> saveFields(Long datasetId, List<DatasetFieldDTO> fields);
}
