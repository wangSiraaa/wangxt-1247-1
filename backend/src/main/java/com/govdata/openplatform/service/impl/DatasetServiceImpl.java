package com.govdata.openplatform.service.impl;

import com.govdata.openplatform.dto.DatasetDTO;
import com.govdata.openplatform.dto.DatasetFieldDTO;
import com.govdata.openplatform.entity.Dataset;
import com.govdata.openplatform.entity.DatasetField;
import com.govdata.openplatform.repository.DatasetFieldRepository;
import com.govdata.openplatform.repository.DatasetRepository;
import com.govdata.openplatform.service.DatasetService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatasetServiceImpl implements DatasetService {

    private final DatasetRepository datasetRepository;
    private final DatasetFieldRepository datasetFieldRepository;

    @Override
    @Transactional
    public DatasetDTO createDataset(DatasetDTO datasetDTO) {
        Dataset dataset = new Dataset();
        dataset.setName(datasetDTO.getName());
        dataset.setCode(datasetDTO.getCode());
        dataset.setDescription(datasetDTO.getDescription());
        dataset.setCategory(datasetDTO.getCategory());
        dataset.setDepartment(datasetDTO.getDepartment());
        dataset.setDataSource(datasetDTO.getDataSource());
        dataset.setUpdateFrequency(datasetDTO.getUpdateFrequency());
        dataset.setStatus(Dataset.DatasetStatus.DRAFT);
        dataset.setCreatedBy(datasetDTO.getCreatedBy());

        Dataset saved = datasetRepository.save(dataset);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public DatasetDTO updateDataset(Long id, DatasetDTO datasetDTO) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + id));

        dataset.setName(datasetDTO.getName());
        dataset.setDescription(datasetDTO.getDescription());
        dataset.setCategory(datasetDTO.getCategory());
        dataset.setDepartment(datasetDTO.getDepartment());
        dataset.setDataSource(datasetDTO.getDataSource());
        dataset.setUpdateFrequency(datasetDTO.getUpdateFrequency());

        Dataset saved = datasetRepository.save(dataset);
        return toDTO(saved);
    }

    @Override
    public DatasetDTO getDatasetById(Long id) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + id));
        return toDTOWithFields(dataset);
    }

    @Override
    public DatasetDTO getDatasetByCode(String code) {
        Dataset dataset = datasetRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + code));
        return toDTOWithFields(dataset);
    }

    @Override
    public Page<DatasetDTO> getAllDatasets(Pageable pageable) {
        return datasetRepository.findAll(pageable).map(this::toDTO);
    }

    @Override
    public Page<DatasetDTO> getDatasetsByStatus(String status, Pageable pageable) {
        Dataset.DatasetStatus datasetStatus = Dataset.DatasetStatus.valueOf(status);
        return datasetRepository.findByStatus(datasetStatus, pageable).map(this::toDTO);
    }

    @Override
    public Page<DatasetDTO> getPublishedDatasets(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isEmpty()) {
            return datasetRepository.searchPublishedDatasets(keyword, pageable).map(this::toDTO);
        }
        return datasetRepository.findPublishedDatasets(pageable).map(this::toDTO);
    }

    @Override
    @Transactional
    public void deleteDataset(Long id) {
        if (!datasetRepository.existsById(id)) {
            throw new EntityNotFoundException("Dataset not found: " + id);
        }
        datasetRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DatasetDTO submitForReview(Long id) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + id));

        if (dataset.getStatus() != Dataset.DatasetStatus.DRAFT) {
            throw new IllegalStateException("Only draft datasets can be submitted for review");
        }

        dataset.setStatus(Dataset.DatasetStatus.SUBMITTED);
        Dataset saved = datasetRepository.save(dataset);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public DatasetDTO updateStatus(Long id, Dataset.DatasetStatus status) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + id));
        dataset.setStatus(status);
        Dataset saved = datasetRepository.save(dataset);
        return toDTO(saved);
    }

    @Override
    public List<DatasetFieldDTO> getDatasetFields(Long datasetId) {
        return datasetFieldRepository.findByDatasetIdOrderBySortOrder(datasetId)
                .stream()
                .map(this::toFieldDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DatasetFieldDTO addField(Long datasetId, DatasetFieldDTO fieldDTO) {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + datasetId));

        DatasetField field = new DatasetField();
        field.setDataset(dataset);
        field.setFieldName(fieldDTO.getFieldName());
        field.setFieldCode(fieldDTO.getFieldCode());
        field.setDataType(fieldDTO.getDataType());
        field.setDescription(fieldDTO.getDescription());
        field.setSampleData(fieldDTO.getSampleData());
        field.setIsSensitive(fieldDTO.getIsSensitive() != null && fieldDTO.getIsSensitive());
        field.setSensitivityLevel(fieldDTO.getSensitivityLevel() != null ?
                DatasetField.SensitivityLevel.valueOf(fieldDTO.getSensitivityLevel()) : null);
        field.setDesensitizationType(fieldDTO.getDesensitizationType() != null ?
                DatasetField.DesensitizationType.valueOf(fieldDTO.getDesensitizationType()) : null);
        field.setDesensitizationRule(fieldDTO.getDesensitizationRule());
        field.setSortOrder(fieldDTO.getSortOrder());

        DatasetField saved = datasetFieldRepository.save(field);
        return toFieldDTO(saved);
    }

    @Override
    @Transactional
    public DatasetFieldDTO updateField(Long fieldId, DatasetFieldDTO fieldDTO) {
        DatasetField field = datasetFieldRepository.findById(fieldId)
                .orElseThrow(() -> new EntityNotFoundException("Field not found: " + fieldId));

        field.setFieldName(fieldDTO.getFieldName());
        field.setFieldCode(fieldDTO.getFieldCode());
        field.setDataType(fieldDTO.getDataType());
        field.setDescription(fieldDTO.getDescription());
        field.setSampleData(fieldDTO.getSampleData());
        field.setIsSensitive(fieldDTO.getIsSensitive() != null && fieldDTO.getIsSensitive());
        if (fieldDTO.getSensitivityLevel() != null) {
            field.setSensitivityLevel(DatasetField.SensitivityLevel.valueOf(fieldDTO.getSensitivityLevel()));
        }
        if (fieldDTO.getDesensitizationType() != null) {
            field.setDesensitizationType(DatasetField.DesensitizationType.valueOf(fieldDTO.getDesensitizationType()));
        }
        field.setDesensitizationRule(fieldDTO.getDesensitizationRule());
        field.setSortOrder(fieldDTO.getSortOrder());

        DatasetField saved = datasetFieldRepository.save(field);
        return toFieldDTO(saved);
    }

    @Override
    @Transactional
    public void deleteField(Long fieldId) {
        if (!datasetFieldRepository.existsById(fieldId)) {
            throw new EntityNotFoundException("Field not found: " + fieldId);
        }
        datasetFieldRepository.deleteById(fieldId);
    }

    @Override
    @Transactional
    public List<DatasetFieldDTO> saveFields(Long datasetId, List<DatasetFieldDTO> fields) {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + datasetId));

        List<DatasetField> existingFields = datasetFieldRepository.findByDatasetIdOrderBySortOrder(datasetId);

        List<DatasetField> savedFields = new ArrayList<>();
        for (DatasetFieldDTO dto : fields) {
            DatasetField field;
            if (dto.getId() != null) {
                field = existingFields.stream()
                        .filter(f -> f.getId().equals(dto.getId()))
                        .findFirst()
                        .orElse(new DatasetField());
                field.setDataset(dataset);
            } else {
                field = new DatasetField();
                field.setDataset(dataset);
            }
            field.setFieldName(dto.getFieldName());
            field.setFieldCode(dto.getFieldCode());
            field.setDataType(dto.getDataType());
            field.setDescription(dto.getDescription());
            field.setSampleData(dto.getSampleData());
            field.setIsSensitive(dto.getIsSensitive() != null && dto.getIsSensitive());
            field.setSensitivityLevel(dto.getSensitivityLevel() != null ?
                    DatasetField.SensitivityLevel.valueOf(dto.getSensitivityLevel()) : null);
            field.setDesensitizationType(dto.getDesensitizationType() != null ?
                    DatasetField.DesensitizationType.valueOf(dto.getDesensitizationType()) : null);
            field.setDesensitizationRule(dto.getDesensitizationRule());
            field.setSortOrder(dto.getSortOrder());

            savedFields.add(datasetFieldRepository.save(field));
        }

        return savedFields.stream().map(this::toFieldDTO).collect(Collectors.toList());
    }

    private DatasetDTO toDTO(Dataset dataset) {
        return DatasetDTO.builder()
                .id(dataset.getId())
                .name(dataset.getName())
                .code(dataset.getCode())
                .description(dataset.getDescription())
                .category(dataset.getCategory())
                .department(dataset.getDepartment())
                .dataSource(dataset.getDataSource())
                .updateFrequency(dataset.getUpdateFrequency())
                .status(dataset.getStatus().name())
                .currentVersion(dataset.getCurrentVersion())
                .publishedVersion(dataset.getPublishedVersion())
                .createdAt(dataset.getCreatedAt())
                .updatedAt(dataset.getUpdatedAt())
                .createdBy(dataset.getCreatedBy())
                .build();
    }

    private DatasetDTO toDTOWithFields(Dataset dataset) {
        DatasetDTO dto = toDTO(dataset);
        dto.setFields(getDatasetFields(dataset.getId()));
        return dto;
    }

    private DatasetFieldDTO toFieldDTO(DatasetField field) {
        return DatasetFieldDTO.builder()
                .id(field.getId())
                .fieldName(field.getFieldName())
                .fieldCode(field.getFieldCode())
                .dataType(field.getDataType())
                .description(field.getDescription())
                .sampleData(field.getSampleData())
                .isSensitive(field.getIsSensitive())
                .sensitivityLevel(field.getSensitivityLevel() != null ? field.getSensitivityLevel().name() : null)
                .desensitizationType(field.getDesensitizationType() != null ? field.getDesensitizationType().name() : null)
                .desensitizationRule(field.getDesensitizationRule())
                .sortOrder(field.getSortOrder())
                .createdAt(field.getCreatedAt())
                .updatedAt(field.getUpdatedAt())
                .build();
    }
}
