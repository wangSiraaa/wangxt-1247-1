package com.govdata.openplatform.controller;

import com.govdata.openplatform.common.ApiResponse;
import com.govdata.openplatform.dto.DatasetDTO;
import com.govdata.openplatform.dto.DatasetFieldDTO;
import com.govdata.openplatform.service.DatasetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/datasets")
@RequiredArgsConstructor
@Tag(name = "数据集管理", description = "数据集的增删改查及状态管理")
public class DatasetController {

    private final DatasetService datasetService;

    @PostMapping
    @Operation(summary = "创建数据集", description = "业务处室提交新的数据集")
    public ApiResponse<DatasetDTO> createDataset(@RequestBody DatasetDTO datasetDTO) {
        return ApiResponse.success(datasetService.createDataset(datasetDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新数据集", description = "更新数据集基本信息")
    public ApiResponse<DatasetDTO> updateDataset(
            @PathVariable Long id,
            @RequestBody DatasetDTO datasetDTO) {
        return ApiResponse.success(datasetService.updateDataset(id, datasetDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取数据集详情", description = "根据ID获取数据集详细信息，包含字段列表")
    public ApiResponse<DatasetDTO> getDatasetById(@PathVariable Long id) {
        return ApiResponse.success(datasetService.getDatasetById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "根据编码获取数据集", description = "根据数据集编码获取详情")
    public ApiResponse<DatasetDTO> getDatasetByCode(@PathVariable String code) {
        return ApiResponse.success(datasetService.getDatasetByCode(code));
    }

    @GetMapping
    @Operation(summary = "获取数据集列表", description = "分页查询所有数据集")
    public ApiResponse<Page<DatasetDTO>> getAllDatasets(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(datasetService.getAllDatasets(pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "按状态查询数据集", description = "根据状态分页查询数据集")
    public ApiResponse<Page<DatasetDTO>> getDatasetsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(datasetService.getDatasetsByStatus(status, pageable));
    }

    @GetMapping("/published")
    @Operation(summary = "获取已发布数据集", description = "公众端使用，查询已发布的数据集，支持关键词搜索")
    public ApiResponse<Page<DatasetDTO>> getPublishedDatasets(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(datasetService.getPublishedDatasets(keyword, pageable));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除数据集", description = "删除指定数据集（仅草稿状态可删除）")
    public ApiResponse<Void> deleteDataset(@PathVariable Long id) {
        datasetService.deleteDataset(id);
        return ApiResponse.success("删除成功", null);
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "提交审查", description = "将数据集提交给数据办进行脱敏审查")
    public ApiResponse<DatasetDTO> submitForReview(@PathVariable Long id) {
        return ApiResponse.success(datasetService.submitForReview(id));
    }

    @GetMapping("/{datasetId}/fields")
    @Operation(summary = "获取数据集字段列表", description = "获取数据集的所有字段定义")
    public ApiResponse<List<DatasetFieldDTO>> getDatasetFields(@PathVariable Long datasetId) {
        return ApiResponse.success(datasetService.getDatasetFields(datasetId));
    }

    @PostMapping("/{datasetId}/fields")
    @Operation(summary = "添加字段", description = "向数据集中添加新字段")
    public ApiResponse<DatasetFieldDTO> addField(
            @PathVariable Long datasetId,
            @RequestBody DatasetFieldDTO fieldDTO) {
        return ApiResponse.success(datasetService.addField(datasetId, fieldDTO));
    }

    @PutMapping("/fields/{fieldId}")
    @Operation(summary = "更新字段", description = "更新字段信息")
    public ApiResponse<DatasetFieldDTO> updateField(
            @PathVariable Long fieldId,
            @RequestBody DatasetFieldDTO fieldDTO) {
        return ApiResponse.success(datasetService.updateField(fieldId, fieldDTO));
    }

    @DeleteMapping("/fields/{fieldId}")
    @Operation(summary = "删除字段", description = "删除指定字段")
    public ApiResponse<Void> deleteField(@PathVariable Long fieldId) {
        datasetService.deleteField(fieldId);
        return ApiResponse.success("删除成功", null);
    }

    @PostMapping("/{datasetId}/fields/batch")
    @Operation(summary = "批量保存字段", description = "批量保存或更新数据集字段")
    public ApiResponse<List<DatasetFieldDTO>> saveFields(
            @PathVariable Long datasetId,
            @RequestBody List<DatasetFieldDTO> fields) {
        return ApiResponse.success(datasetService.saveFields(datasetId, fields));
    }
}
