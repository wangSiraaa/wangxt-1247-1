export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface Dataset {
  id: number
  name: string
  code: string
  description: string
  category: string
  department: string
  dataSource: string
  updateFrequency: string
  status: DatasetStatus
  currentVersion: string
  publishedVersion: string
  createdAt: string
  updatedAt: string
  createdBy: string
  fields?: DatasetField[]
  versions?: DatasetVersion[]
}

export type DatasetStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED'

export const DatasetStatusMap: Record<DatasetStatus, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  UNDER_REVIEW: '审查中',
  REVIEW_APPROVED: '审查通过',
  REVIEW_REJECTED: '审查驳回',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
}

export const DatasetStatusColorMap: Record<DatasetStatus, string> = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  UNDER_REVIEW: 'processing',
  REVIEW_APPROVED: 'success',
  REVIEW_REJECTED: 'error',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
}

export interface DatasetField {
  id: number
  fieldName: string
  fieldCode: string
  dataType: string
  description: string
  sampleData: string
  isSensitive: boolean
  sensitivityLevel?: SensitivityLevel
  desensitizationType?: DesensitizationType
  desensitizationRule?: string
  sortOrder: number
  isNew?: boolean
  isModified?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SensitivityLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export const SensitivityLevelMap: Record<SensitivityLevel, string> = {
  NONE: '无',
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '极高',
}

export const SensitivityLevelColorMap: Record<SensitivityLevel, string> = {
  NONE: 'default',
  LOW: 'blue',
  MEDIUM: 'orange',
  HIGH: 'red',
  CRITICAL: 'magenta',
}

export type DesensitizationType =
  | 'NONE'
  | 'MASKING'
  | 'HASHING'
  | 'ENCRYPTION'
  | 'REPLACEMENT'
  | 'AGGREGATION'
  | 'CUSTOM'

export const DesensitizationTypeMap: Record<DesensitizationType, string> = {
  NONE: '不脱敏',
  MASKING: '掩码',
  HASHING: '哈希',
  ENCRYPTION: '加密',
  REPLACEMENT: '替换',
  AGGREGATION: '聚合',
  CUSTOM: '自定义',
}

export interface DatasetVersion {
  id: number
  versionNumber: string
  versionName: string
  changeDescription: string
  status: VersionStatus
  isPublished: boolean
  publishedAt: string
  publishWindowId: number
  fieldCount: number
  recordCount: number
  dataSizeBytes: number
  createdAt: string
  updatedAt: string
  createdBy: string
  fields?: DatasetField[]
  reviewRecords?: ReviewRecord[]
}

export type VersionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED'

export const VersionStatusMap: Record<VersionStatus, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  UNDER_REVIEW: '审查中',
  REVIEW_APPROVED: '审查通过',
  REVIEW_REJECTED: '审查驳回',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
}

export const VersionStatusColorMap: Record<VersionStatus, string> = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  UNDER_REVIEW: 'processing',
  REVIEW_APPROVED: 'success',
  REVIEW_REJECTED: 'error',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
}

export interface ReviewRecord {
  id: number
  datasetId: number
  versionId?: number
  versionNumber?: string
  reviewType: ReviewType
  reviewStatus: ReviewStatus
  reviewer?: string
  reviewOpinion?: string
  reviewDate?: string
  sensitiveFieldCount?: number
  highRiskFieldCount?: number
  createdAt: string
  updatedAt: string
}

export type ReviewType =
  | 'DESENSITIZATION'
  | 'SECURITY'
  | 'LEGAL'
  | 'QUALITY'
  | 'FINAL'

export const ReviewTypeMap: Record<ReviewType, string> = {
  DESENSITIZATION: '脱敏审查',
  SECURITY: '安全审查',
  LEGAL: '合规审查',
  QUALITY: '质量审查',
  FINAL: '终审',
}

export type ReviewStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVISION'

export const ReviewStatusMap: Record<ReviewStatus, string> = {
  PENDING: '待处理',
  IN_PROGRESS: '处理中',
  APPROVED: '通过',
  REJECTED: '驳回',
  NEEDS_REVISION: '需修改',
}

export const ReviewStatusColorMap: Record<ReviewStatus, string> = {
  PENDING: 'default',
  IN_PROGRESS: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  NEEDS_REVISION: 'warning',
}

export interface PublishWindow {
  id: number
  title: string
  description: string
  remark: string
  windowStart: string
  windowEnd: string
  status: WindowStatus
  publishType: PublishType
  maxDatasets: number
  publishedCount: number
  createdAt: string
  updatedAt: string
}

export type WindowStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED' | 'CANCELLED'

export const WindowStatusMap: Record<WindowStatus, string> = {
  PLANNED: '计划中',
  ACTIVE: '进行中',
  CLOSED: '已关闭',
  CANCELLED: '已取消',
}

export const WindowStatusColorMap: Record<WindowStatus, string> = {
  PLANNED: 'default',
  ACTIVE: 'processing',
  CLOSED: 'success',
  CANCELLED: 'error',
}

export type PublishType = 'ROUTINE' | 'EMERGENCY' | 'SPECIAL'

export const PublishTypeMap: Record<PublishType, string> = {
  ROUTINE: '常规',
  EMERGENCY: '应急',
  SPECIAL: '专项',
}

export interface User {
  id: number
  username: string
  realName: string
  email: string
  phone: string
  department: string
  role: UserRole
  isActive: boolean
}

export type UserRole = 'BUSINESS' | 'DATA_OFFICE' | 'ADMIN' | 'PUBLIC'

export const UserRoleMap: Record<UserRole, string> = {
  BUSINESS: '业务处室',
  DATA_OFFICE: '数据办',
  ADMIN: '管理员',
  PUBLIC: '公众',
}
