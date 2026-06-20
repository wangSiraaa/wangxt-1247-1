package com.govdata.openplatform.controller;

import com.govdata.openplatform.common.ApiResponse;
import com.govdata.openplatform.dto.DatasetFieldDTO;
import com.govdata.openplatform.dto.DatasetVersionDTO;
import com.govdata.openplatform.service.DatasetVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/versions")
@RequiredArgsConstructor
@Tag(name = "版本管理", description = "数据集版本的创建、发布、变更说明等")
public class DatasetVersionController {

    private final DatasetVersionService versionService;

    @PostMapping("/dataset/{datasetId}")
    @Operation(summary = "创建新版本", description = "基于数据集创建新版本，自动复制上一版本字段")
    public ApiResponse<DatasetVersionDTO> createVersion(
            @PathVariable Long datasetId,
            @RequestBody DatasetVersionDTO versionDTO) {
        return ApiResponse.success(versionService.createVersion(datasetId, versionDTO));
    }

    @GetMapping("/{versionId}")
    @Operation(summary = "获取版本详情", description = "根据ID获取版本详细信息，包含字段列表")
    public ApiResponse<DatasetVersionDTO> getVersionById(@PathVariable Long versionId) {
        return ApiResponse.success(versionService.getVersionById(versionId));
    }

    @GetMapping("/dataset/{datasetId}")
    @Operation(summary = "获取数据集所有版本", description = "按创建时间倒序返回数据集的所有版本")
    public ApiResponse<List<DatasetVersionDTO>> getVersionsByDatasetId(@PathVariable Long datasetId) {
        return ApiResponse.success(versionService.getVersionsByDatasetId(datasetId));
    }

    @GetMapping("/dataset/{datasetId}/published")
    @Operation(summary = "获取已发布版本", description = "获取数据集的所有已发布版本")
    public ApiResponse<List<DatasetVersionDTO>> getPublishedVersions(@PathVariable Long datasetId) {
        return ApiResponse.success(versionService.getPublishedVersions(datasetId));
    }

    @GetMapping("/dataset/{datasetId}/status/{status}")
    @Operation(summary = "按状态查询版本", description = "根据状态分页查询数据集版本")
    public ApiResponse<Page<DatasetVersionDTO>> getVersionsByStatus(
            @PathVariable Long datasetId,
            @PathVariable String status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(versionService.getVersionsByStatus(datasetId, status, pageable));
    }

    @PutMapping("/{versionId}")
    @Operation(summary = "更新版本信息", description = "更新版本名称和变更说明（仅草稿状态）")
    public ApiResponse<DatasetVersionDTO> updateVersion(
            @PathVariable Long versionId,
            @RequestBody DatasetVersionDTO versionDTO) {
        return ApiResponse.success(versionService.updateVersion(versionId, versionDTO));
    }

    @PostMapping("/{versionId}/submit")
    @Operation(summary = "提交版本审查", description = "将版本提交脱敏审查")
    public ApiResponse<DatasetVersionDTO> submitForReview(@PathVariable Long versionId) {
        return ApiResponse.success(versionService.submitForReview(versionId));
    }

    @PostMapping("/{versionId}/publish")
    @Operation(summary = "发布版本", description = "在发布窗口内发布版本（需先通过审查）")
    public ApiResponse<DatasetVersionDTO> publishVersion(
            @PathVariable Long versionId,
            @RequestBody Map<String, Long> request) {
        Long publishWindowId = request.get("publishWindowId");
        return ApiResponse.success(versionService.publishVersion(versionId, publishWindowId));
    }

    @PostMapping("/{versionId}/archive")
    @Operation(summary = "归档版本", description = "归档已发布的版本")
    public ApiResponse<DatasetVersionDTO> archiveVersion(@PathVariable Long versionId) {
        return ApiResponse.success(versionService.archiveVersion(versionId));
    }

    @GetMapping("/{versionId}/fields")
    @Operation(summary = "获取版本字段", description = "获取指定版本的字段列表")
    public ApiResponse<List<DatasetFieldDTO>> getVersionFields(@PathVariable Long versionId) {
        return ApiResponse.success(versionService.getVersionFields(versionId));
    }

    @PostMapping("/{versionId}/fields")
    @Operation(summary = "保存版本字段", description = "批量保存或更新版本字段（仅草稿状态）")
    public ApiResponse<List<DatasetFieldDTO>> saveVersionFields(
            @PathVariable Long versionId,
            @RequestBody List<DatasetFieldDTO> fields) {
        return ApiResponse.success(versionService.saveVersionFields(versionId, fields));
    }
}
