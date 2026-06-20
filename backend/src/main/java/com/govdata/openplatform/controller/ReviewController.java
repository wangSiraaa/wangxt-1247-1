package com.govdata.openplatform.controller;

import com.govdata.openplatform.common.ApiResponse;
import com.govdata.openplatform.dto.ReviewRecordDTO;
import com.govdata.openplatform.service.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "脱敏审查", description = "数据办对数据集进行脱敏审查管理")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "创建审查记录", description = "创建新的审查记录")
    public ApiResponse<ReviewRecordDTO> createReviewRecord(@RequestBody ReviewRecordDTO reviewDTO) {
        return ApiResponse.success(reviewService.createReviewRecord(reviewDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取审查详情", description = "根据ID获取审查记录详情")
    public ApiResponse<ReviewRecordDTO> getReviewRecordById(@PathVariable Long id) {
        return ApiResponse.success(reviewService.getReviewRecordById(id));
    }

    @GetMapping("/dataset/{datasetId}")
    @Operation(summary = "获取数据集审查记录", description = "查询数据集的所有审查记录")
    public ApiResponse<List<ReviewRecordDTO>> getReviewRecordsByDatasetId(@PathVariable Long datasetId) {
        return ApiResponse.success(reviewService.getReviewRecordsByDatasetId(datasetId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "按状态查询审查", description = "分页查询指定状态的审查记录")
    public ApiResponse<Page<ReviewRecordDTO>> getReviewRecordsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(reviewService.getReviewRecordsByStatus(status, pageable));
    }

    @GetMapping("/reviewer/{reviewer}")
    @Operation(summary = "按审查人查询", description = "分页查询指定审查人的审查记录")
    public ApiResponse<Page<ReviewRecordDTO>> getReviewRecordsByReviewer(
            @PathVariable String reviewer,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.success(reviewService.getReviewRecordsByReviewer(reviewer, pageable));
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "更新审查状态", description = "更新审查记录的状态")
    public ApiResponse<ReviewRecordDTO> updateReviewStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        String opinion = request.get("opinion");
        String reviewer = request.get("reviewer");
        return ApiResponse.success(reviewService.updateReviewStatus(id, status, opinion, reviewer));
    }

    @PostMapping("/start/version/{versionId}")
    @Operation(summary = "开始脱敏审查", description = "数据办开始对版本进行脱敏审查")
    public ApiResponse<ReviewRecordDTO> startDesensitizationReview(@PathVariable Long versionId) {
        return ApiResponse.success(reviewService.startDesensitizationReview(versionId));
    }

    @PostMapping("/{reviewId}/approve")
    @Operation(summary = "通过脱敏审查", description = "数据办审批通过脱敏审查")
    public ApiResponse<ReviewRecordDTO> approveDesensitizationReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        String reviewer = request.get("reviewer");
        String opinion = request.get("opinion");
        return ApiResponse.success(reviewService.approveDesensitizationReview(reviewId, reviewer, opinion));
    }

    @PostMapping("/{reviewId}/reject")
    @Operation(summary = "驳回脱敏审查", description = "数据办驳回脱敏审查")
    public ApiResponse<ReviewRecordDTO> rejectDesensitizationReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        String reviewer = request.get("reviewer");
        String opinion = request.get("opinion");
        return ApiResponse.success(reviewService.rejectDesensitizationReview(reviewId, reviewer, opinion));
    }

    @PostMapping("/{reviewId}/revision")
    @Operation(summary = "要求修改", description = "要求业务处室修改后重新提交")
    public ApiResponse<ReviewRecordDTO> requestRevision(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        String reviewer = request.get("reviewer");
        String opinion = request.get("opinion");
        return ApiResponse.success(reviewService.requestRevision(reviewId, reviewer, opinion));
    }
}
