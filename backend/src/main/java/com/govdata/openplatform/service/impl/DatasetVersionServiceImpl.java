package com.govdata.openplatform.service.impl;

import com.govdata.openplatform.dto.DatasetFieldDTO;
import com.govdata.openplatform.dto.DatasetVersionDTO;
import com.govdata.openplatform.entity.Dataset;
import com.govdata.openplatform.entity.DatasetField;
import com.govdata.openplatform.entity.DatasetVersion;
import com.govdata.openplatform.entity.PublishWindow;
import com.govdata.openplatform.entity.VersionField;
import com.govdata.openplatform.repository.DatasetRepository;
import com.govdata.openplatform.repository.DatasetVersionRepository;
import com.govdata.openplatform.repository.PublishWindowRepository;
import com.govdata.openplatform.repository.VersionFieldRepository;
import com.govdata.openplatform.service.DatasetVersionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatasetVersionServiceImpl implements DatasetVersionService {

    private final DatasetVersionRepository versionRepository;
    private final DatasetRepository datasetRepository;
    private final VersionFieldRepository versionFieldRepository;
    private final PublishWindowRepository publishWindowRepository;

    @Override
    @Transactional
    public DatasetVersionDTO createVersion(Long datasetId, DatasetVersionDTO versionDTO) {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new EntityNotFoundException("Dataset not found: " + datasetId));

        DatasetVersion lastVersion = versionRepository.findFirstByDatasetIdOrderByVersionNumberDesc(datasetId)
                .orElse(null);

        String newVersionNumber = generateVersionNumber(lastVersion != null ? lastVersion.getVersionNumber() : null);

        DatasetVersion version = new DatasetVersion();
        version.setDataset(dataset);
        version.setVersionNumber(newVersionNumber);
        version.setVersionName(versionDTO.getVersionName());
        version.setChangeDescription(versionDTO.getChangeDescription());
        version.setStatus(DatasetVersion.VersionStatus.DRAFT);
        version.setIsPublished(false);
        version.setFieldCount(0);
        version.setCreatedBy(versionDTO.getCreatedBy());

        DatasetVersion saved = versionRepository.save(version);

        if (lastVersion != null) {
            copyFieldsFromPreviousVersion(lastVersion.getId(), saved.getId());
        }

        dataset.setCurrentVersion(newVersionNumber);
        datasetRepository.save(dataset);

        return toDTO(saved);
    }

    @Override
    public DatasetVersionDTO getVersionById(Long versionId) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));
        return toDTOWithFields(version);
    }

    @Override
    public List<DatasetVersionDTO> getVersionsByDatasetId(Long datasetId) {
        return versionRepository.findByDatasetIdOrderByCreatedAtDesc(datasetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DatasetVersionDTO> getPublishedVersions(Long datasetId) {
        return versionRepository.findPublishedVersionsByDatasetId(datasetId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<DatasetVersionDTO> getVersionsByStatus(Long datasetId, String status, Pageable pageable) {
        DatasetVersion.VersionStatus versionStatus = DatasetVersion.VersionStatus.valueOf(status);
        return versionRepository.findByDatasetIdAndStatus(datasetId, versionStatus, pageable)
                .map(this::toDTO);
    }

    @Override
    @Transactional
    public DatasetVersionDTO updateVersion(Long versionId, DatasetVersionDTO versionDTO) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));

        if (version.getStatus() != DatasetVersion.VersionStatus.DRAFT) {
            throw new IllegalStateException("Only draft versions can be updated");
        }

        version.setVersionName(versionDTO.getVersionName());
        version.setChangeDescription(versionDTO.getChangeDescription());

        DatasetVersion saved = versionRepository.save(version);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public DatasetVersionDTO submitForReview(Long versionId) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));

        if (version.getStatus() != DatasetVersion.VersionStatus.DRAFT) {
            throw new IllegalStateException("Only draft versions can be submitted for review");
        }

        long fieldCount = versionFieldRepository.countByVersionIdAndIsSensitiveTrue(versionId);
        version.setFieldCount((int) versionFieldRepository.count());
        version.setStatus(DatasetVersion.VersionStatus.SUBMITTED);

        Dataset dataset = version.getDataset();
        dataset.setStatus(Dataset.DatasetStatus.SUBMITTED);
        datasetRepository.save(dataset);

        DatasetVersion saved = versionRepository.save(version);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public DatasetVersionDTO publishVersion(Long versionId, Long publishWindowId) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));

        if (version.getStatus() != DatasetVersion.VersionStatus.REVIEW_APPROVED) {
            throw new IllegalStateException("Only review-approved versions can be published");
        }

        if (version.getIsPublished()) {
            throw new IllegalStateException("This version is already published");
        }

        PublishWindow window = publishWindowRepository.findById(publishWindowId)
                .orElseThrow(() -> new EntityNotFoundException("Publish window not found: " + publishWindowId));

        if (window.getStatus() != PublishWindow.WindowStatus.ACTIVE) {
            throw new IllegalStateException("Publish window is not active");
        }

        version.setIsPublished(true);
        version.setPublishedAt(LocalDateTime.now());
        version.setPublishWindowId(publishWindowId);
        version.setStatus(DatasetVersion.VersionStatus.PUBLISHED);

        Dataset dataset = version.getDataset();
        dataset.setStatus(Dataset.DatasetStatus.PUBLISHED);
        dataset.setPublishedVersion(version.getVersionNumber());
        datasetRepository.save(dataset);

        window.setPublishedCount(window.getPublishedCount() + 1);
        publishWindowRepository.save(window);

        DatasetVersion saved = versionRepository.save(version);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public DatasetVersionDTO archiveVersion(Long versionId) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));

        if (!version.getIsPublished()) {
            throw new IllegalStateException("Only published versions can be archived");
        }

        version.setStatus(DatasetVersion.VersionStatus.ARCHIVED);
        DatasetVersion saved = versionRepository.save(version);
        return toDTO(saved);
    }

    @Override
    public List<DatasetFieldDTO> getVersionFields(Long versionId) {
        return versionFieldRepository.findByVersionIdOrderBySortOrder(versionId)
                .stream()
                .map(this::toFieldDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<DatasetFieldDTO> saveVersionFields(Long versionId, List<DatasetFieldDTO> fields) {
        DatasetVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new EntityNotFoundException("Version not found: " + versionId));

        if (version.getStatus() != DatasetVersion.VersionStatus.DRAFT) {
            throw new IllegalStateException("Only draft version fields can be modified");
        }

        List<VersionField> existingFields = versionFieldRepository.findByVersionIdOrderBySortOrder(versionId);

        List<VersionField> savedFields = new ArrayList<>();
        for (DatasetFieldDTO dto : fields) {
            VersionField field;
            if (dto.getId() != null) {
                field = existingFields.stream()
                        .filter(f -> f.getId().equals(dto.getId()))
                        .findFirst()
                        .orElse(new VersionField());
                field.setVersion(version);
            } else {
                field = new VersionField();
                field.setVersion(version);
                field.setIsNew(true);
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
            field.setIsModified(dto.getIsModified() != null && dto.getIsModified());

            savedFields.add(versionFieldRepository.save(field));
        }

        version.setFieldCount(savedFields.size());
        versionRepository.save(version);

        return savedFields.stream().map(this::toFieldDTO).collect(Collectors.toList());
    }

    private void copyFieldsFromPreviousVersion(Long oldVersionId, Long newVersionId) {
        List<VersionField> oldFields = versionFieldRepository.findByVersionIdOrderBySortOrder(oldVersionId);
        DatasetVersion newVersion = versionRepository.findById(newVersionId).orElseThrow();

        for (VersionField oldField : oldFields) {
            VersionField newField = new VersionField();
            newField.setVersion(newVersion);
            newField.setFieldName(oldField.getFieldName());
            newField.setFieldCode(oldField.getFieldCode());
            newField.setDataType(oldField.getDataType());
            newField.setDescription(oldField.getDescription());
            newField.setSampleData(oldField.getSampleData());
            newField.setIsSensitive(oldField.getIsSensitive());
            newField.setSensitivityLevel(oldField.getSensitivityLevel());
            newField.setDesensitizationType(oldField.getDesensitizationType());
            newField.setDesensitizationRule(oldField.getDesensitizationRule());
            newField.setSortOrder(oldField.getSortOrder());
            newField.setIsNew(false);
            newField.setIsModified(false);
            versionFieldRepository.save(newField);
        }
    }

    private String generateVersionNumber(String lastVersion) {
        if (lastVersion == null || lastVersion.isEmpty()) {
            return "1.0";
        }
        String[] parts = lastVersion.split("\\.");
        int major = parts.length > 0 ? Integer.parseInt(parts[0]) : 1;
        int minor = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        return major + "." + (minor + 1);
    }

    private DatasetVersionDTO toDTO(DatasetVersion version) {
        return DatasetVersionDTO.builder()
                .id(version.getId())
                .versionNumber(version.getVersionNumber())
                .versionName(version.getVersionName())
                .changeDescription(version.getChangeDescription())
                .status(version.getStatus().name())
                .isPublished(version.getIsPublished())
                .publishedAt(version.getPublishedAt())
                .publishWindowId(version.getPublishWindowId())
                .fieldCount(version.getFieldCount())
                .recordCount(version.getRecordCount())
                .dataSizeBytes(version.getDataSizeBytes())
                .createdAt(version.getCreatedAt())
                .updatedAt(version.getUpdatedAt())
                .createdBy(version.getCreatedBy())
                .build();
    }

    private DatasetVersionDTO toDTOWithFields(DatasetVersion version) {
        DatasetVersionDTO dto = toDTO(version);
        dto.setFields(getVersionFields(version.getId()));
        return dto;
    }

    private DatasetFieldDTO toFieldDTO(VersionField field) {
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
                .isNew(field.getIsNew())
                .isModified(field.getIsModified())
                .build();
    }
}
