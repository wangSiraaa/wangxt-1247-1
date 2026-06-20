package com.govdata.openplatform.controller;

import com.govdata.openplatform.common.ApiResponse;
import com.govdata.openplatform.dto.PublishWindowDTO;
import com.govdata.openplatform.service.PublishWindowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publish-windows")
@RequiredArgsConstructor
@Tag(name = "发布窗口管理", description = "管理员管理数据发布窗口")
public class PublishWindowController {

    private final PublishWindowService windowService;

    @PostMapping
    @Operation(summary = "创建发布窗口", description = "管理员创建新的发布窗口")
    public ApiResponse<PublishWindowDTO> createWindow(@RequestBody PublishWindowDTO windowDTO) {
        return ApiResponse.success(windowService.createWindow(windowDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新发布窗口", description = "更新发布窗口信息（仅计划中状态）")
    public ApiResponse<PublishWindowDTO> updateWindow(
            @PathVariable Long id,
            @RequestBody PublishWindowDTO windowDTO) {
        return ApiResponse.success(windowService.updateWindow(id, windowDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取发布窗口详情", description = "根据ID获取发布窗口详细信息")
    public ApiResponse<PublishWindowDTO> getWindowById(@PathVariable Long id) {
        return ApiResponse.success(windowService.getWindowById(id));
    }

    @GetMapping
    @Operation(summary = "获取所有发布窗口", description = "分页查询所有发布窗口")
    public ApiResponse<Page<PublishWindowDTO>> getAllWindows(
            @PageableDefault(size = 20, sort = "windowStart") Pageable pageable) {
        return ApiResponse.success(windowService.getAllWindows(pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "按状态查询发布窗口", description = "分页查询指定状态的发布窗口")
    public ApiResponse<Page<PublishWindowDTO>> getWindowsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20, sort = "windowStart") Pageable pageable) {
        return ApiResponse.success(windowService.getWindowsByStatus(status, pageable));
    }

    @GetMapping("/active")
    @Operation(summary = "获取当前活动窗口", description = "查询当前正在进行的发布窗口")
    public ApiResponse<List<PublishWindowDTO>> getActiveWindows() {
        return ApiResponse.success(windowService.getActiveWindows());
    }

    @GetMapping("/upcoming")
    @Operation(summary = "获取即将开始的窗口", description = "查询即将开始的发布窗口")
    public ApiResponse<List<PublishWindowDTO>> getUpcomingWindows() {
        return ApiResponse.success(windowService.getUpcomingWindows());
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "激活发布窗口", description = "将计划中的发布窗口置为活动状态")
    public ApiResponse<PublishWindowDTO> activateWindow(@PathVariable Long id) {
        return ApiResponse.success(windowService.activateWindow(id));
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "关闭发布窗口", description = "关闭活动的发布窗口")
    public ApiResponse<PublishWindowDTO> closeWindow(@PathVariable Long id) {
        return ApiResponse.success(windowService.closeWindow(id));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "取消发布窗口", description = "取消计划中的发布窗口")
    public ApiResponse<PublishWindowDTO> cancelWindow(@PathVariable Long id) {
        return ApiResponse.success(windowService.cancelWindow(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除发布窗口", description = "删除发布窗口（非活动状态）")
    public ApiResponse<Void> deleteWindow(@PathVariable Long id) {
        windowService.deleteWindow(id);
        return ApiResponse.success("删除成功", null);
    }
}
