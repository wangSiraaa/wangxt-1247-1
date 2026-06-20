import request from '@/utils/request'
import type { Dataset, DatasetField, DatasetVersion } from '@/types'

export const datasetApi = {
  getAll(params: { page?: number; size?: number } = {}) {
    return request.get<any, { content: Dataset[]; totalElements: number; totalPages: number }>(
      '/datasets',
      { params: { page: params.page, size: params.size } }
    )
  },

  getByStatus(status: string, params: { page?: number; size?: number } = {}) {
    return request.get<any, { content: Dataset[]; totalElements: number; totalPages: number }>(
      `/datasets/status/${status}`,
      { params: { page: params.page, size: params.size } }
    )
  },

  getPublished(keyword?: string, params: { page?: number; size?: number } = {}) {
    return request.get<any, { content: Dataset[]; totalElements: number; totalPages: number }>(
      '/datasets/published',
      { params: { keyword, page: params.page, size: params.size } }
    )
  },

  getById(id: number) {
    return request.get<any, Dataset>(`/datasets/${id}`)
  },

  getByCode(code: string) {
    return request.get<any, Dataset>(`/datasets/code/${code}`)
  },

  create(data: Partial<Dataset>) {
    return request.post<any, Dataset>('/datasets', data)
  },

  update(id: number, data: Partial<Dataset>) {
    return request.put<any, Dataset>(`/datasets/${id}`, data)
  },

  remove(id: number) {
    return request.delete(`/datasets/${id}`)
  },

  submitForReview(id: number) {
    return request.post<any, Dataset>(`/datasets/${id}/submit`)
  },

  getFields(datasetId: number) {
    return request.get<any, DatasetField[]>(`/datasets/${datasetId}/fields`)
  },

  addField(datasetId: number, data: Partial<DatasetField>) {
    return request.post<any, DatasetField>(`/datasets/${datasetId}/fields`, data)
  },

  updateField(fieldId: number, data: Partial<DatasetField>) {
    return request.put<any, DatasetField>(`/datasets/fields/${fieldId}`, data)
  },

  removeField(fieldId: number) {
    return request.delete(`/datasets/fields/${fieldId}`)
  },

  saveFields(datasetId: number, fields: DatasetField[]) {
    return request.post<any, DatasetField[]>(`/datasets/${datasetId}/fields/batch`, fields)
  },
}

export const versionApi = {
  create(datasetId: number, data: Partial<DatasetVersion>) {
    return request.post<any, DatasetVersion>(`/versions/dataset/${datasetId}`, data)
  },

  getById(id: number) {
    return request.get<any, DatasetVersion>(`/versions/${id}`)
  },

  getByDataset(datasetId: number) {
    return request.get<any, DatasetVersion[]>(`/versions/dataset/${datasetId}`)
  },

  getPublished(datasetId: number) {
    return request.get<any, DatasetVersion[]>(`/versions/dataset/${datasetId}/published`)
  },

  update(id: number, data: Partial<DatasetVersion>) {
    return request.put<any, DatasetVersion>(`/versions/${id}`, data)
  },

  submitForReview(id: number) {
    return request.post<any, DatasetVersion>(`/versions/${id}/submit`)
  },

  publish(id: number, publishWindowId: number) {
    return request.post<any, DatasetVersion>(`/versions/${id}/publish`, { publishWindowId })
  },

  archive(id: number) {
    return request.post<any, DatasetVersion>(`/versions/${id}/archive`)
  },

  getFields(versionId: number) {
    return request.get<any, DatasetField[]>(`/versions/${versionId}/fields`)
  },

  saveFields(versionId: number, fields: DatasetField[]) {
    return request.post<any, DatasetField[]>(`/versions/${versionId}/fields`, fields)
  },
}

export const reviewApi = {
  create(data: any) {
    return request.post<any, any>('/reviews', data)
  },

  getById(id: number) {
    return request.get<any, any>(`/reviews/${id}`)
  },

  getByDataset(datasetId: number) {
    return request.get<any, any[]>(`/reviews/dataset/${datasetId}`)
  },

  getByStatus(status: string, params: { page?: number; size?: number } = {}) {
    return request.get<any, { content: any[]; totalElements: number }>(
      `/reviews/status/${status}`,
      { params: { page: params.page, size: params.size } }
    )
  },

  updateStatus(id: number, status: string, opinion: string, reviewer: string) {
    return request.post<any, any>(`/reviews/${id}/status`, { status, opinion, reviewer })
  },

  startDesensitizationReview(versionId: number) {
    return request.post<any, any>(`/reviews/start/version/${versionId}`)
  },

  approve(reviewId: number, reviewer: string, opinion: string) {
    return request.post<any, any>(`/reviews/${reviewId}/approve`, { reviewer, opinion })
  },

  reject(reviewId: number, reviewer: string, opinion: string) {
    return request.post<any, any>(`/reviews/${reviewId}/reject`, { reviewer, opinion })
  },

  requestRevision(reviewId: number, reviewer: string, opinion: string) {
    return request.post<any, any>(`/reviews/${reviewId}/revision`, { reviewer, opinion })
  },
}

export const publishWindowApi = {
  create(data: any) {
    return request.post<any, any>('/publish-windows', data)
  },

  update(id: number, data: any) {
    return request.put<any, any>(`/publish-windows/${id}`, data)
  },

  getById(id: number) {
    return request.get<any, any>(`/publish-windows/${id}`)
  },

  getAll(params: { page?: number; size?: number } = {}) {
    return request.get<any, { content: any[]; totalElements: number }>('/publish-windows', {
      params: { page: params.page, size: params.size },
    })
  },

  getByStatus(status: string, params: { page?: number; size?: number } = {}) {
    return request.get<any, { content: any[]; totalElements: number }>(
      `/publish-windows/status/${status}`,
      { params: { page: params.page, size: params.size } }
    )
  },

  getActive() {
    return request.get<any, any[]>('/publish-windows/active')
  },

  getUpcoming() {
    return request.get<any, any[]>('/publish-windows/upcoming')
  },

  activate(id: number) {
    return request.post<any, any>(`/publish-windows/${id}/activate`)
  },

  close(id: number) {
    return request.post<any, any>(`/publish-windows/${id}/close`)
  },

  cancel(id: number) {
    return request.post<any, any>(`/publish-windows/${id}/cancel`)
  },

  remove(id: number) {
    return request.delete(`/publish-windows/${id}`)
  },
}
