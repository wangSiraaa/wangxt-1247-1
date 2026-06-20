import { useState, useEffect } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Tabs,
  Table,
  Modal,
  Form,
  Input as FormInput,
  message,
  Divider,
  List,
  Timeline,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  SendOutlined,
  PlusOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { Dataset, DatasetVersion, DatasetField, ReviewRecord } from '@/types'
import {
  DatasetStatusMap,
  DatasetStatusColorMap,
  VersionStatusMap,
  VersionStatusColorMap,
  SensitivityLevelMap,
  SensitivityLevelColorMap,
  DesensitizationTypeMap,
  ReviewTypeMap,
  ReviewStatusMap,
  ReviewStatusColorMap,
} from '@/types'
import { datasetApi, versionApi, reviewApi } from '@/api'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'

const DatasetDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role } = useUserStore()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [versions, setVersions] = useState<DatasetVersion[]>([])
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const [form] = Form.useForm()

  const datasetId = Number(id)

  const loadData = async () => {
    setLoading(true)
    try {
      const [datasetData, versionData, reviewData] = await Promise.all([
        datasetApi.getById(datasetId),
        versionApi.getByDataset(datasetId),
        reviewApi.getByDataset(datasetId),
      ])
      setDataset(datasetData)
      setVersions(versionData || [])
      setReviews(reviewData || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (datasetId) {
      loadData()
    }
  }, [datasetId])

  const handleCreateVersion = async (values: any) => {
    try {
      await versionApi.create(datasetId, { ...values, createdBy: 'business' })
      message.success('版本创建成功')
      setVersionModalOpen(false)
      form.resetFields()
      loadData()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    }
  }

  const handleSubmitVersion = async (versionId: number) => {
    Modal.confirm({
      title: '确认提交审查',
      content: '提交后将进入脱敏审查流程，是否继续？',
      onOk: async () => {
        try {
          await versionApi.submitForReview(versionId)
          message.success('提交成功')
          loadData()
        } catch (error: any) {
          message.error(error.message || '提交失败')
        }
      },
    })
  }

  const fieldColumns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 150,
    },
    {
      title: '字段编码',
      dataIndex: 'fieldCode',
      key: 'fieldCode',
      width: 150,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '样例数据',
      dataIndex: 'sampleData',
      key: 'sampleData',
      width: 180,
    },
    {
      title: '是否敏感',
      dataIndex: 'isSensitive',
      key: 'isSensitive',
      width: 100,
      render: (isSensitive: boolean) =>
        isSensitive ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>,
    },
    {
      title: '敏感度级别',
      dataIndex: 'sensitivityLevel',
      key: 'sensitivityLevel',
      width: 100,
      render: (level: string) =>
        level ? (
          <Tag color={SensitivityLevelColorMap[level as keyof typeof SensitivityLevelColorMap]}>
            {SensitivityLevelMap[level as keyof typeof SensitivityLevelMap]}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '脱敏方式',
      dataIndex: 'desensitizationType',
      key: 'desensitizationType',
      width: 120,
      render: (type: string) =>
        type ? DesensitizationTypeMap[type as keyof typeof DesensitizationTypeMap] : '-',
    },
  ]

  const versionColumns = [
    {
      title: '版本号',
      dataIndex: 'versionNumber',
      key: 'versionNumber',
      width: 100,
      render: (text: string, record: DatasetVersion) => (
        <span>
          v{text}
          {record.isPublished && <Tag color="green" style={{ marginLeft: 8 }}>已发布</Tag>}
        </span>
      ),
    },
    {
      title: '版本名称',
      dataIndex: 'versionName',
      key: 'versionName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={VersionStatusColorMap[status as keyof typeof VersionStatusColorMap]}>
          {VersionStatusMap[status as keyof typeof VersionStatusMap]}
        </Tag>
      ),
    },
    {
      title: '字段数',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      width: 80,
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 180,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, record: DatasetVersion) => (
        <Space size="small">
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSubmitVersion(record.id)}
            >
              提交审查
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: dataset && (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="数据集名称">{dataset.name}</Descriptions.Item>
          <Descriptions.Item label="数据集编码">{dataset.code}</Descriptions.Item>
          <Descriptions.Item label="数据分类">{dataset.category}</Descriptions.Item>
          <Descriptions.Item label="所属部门">{dataset.department}</Descriptions.Item>
          <Descriptions.Item label="数据来源">{dataset.dataSource}</Descriptions.Item>
          <Descriptions.Item label="更新频率">{dataset.updateFrequency}</Descriptions.Item>
          <Descriptions.Item label="当前状态">
            <Tag color={DatasetStatusColorMap[dataset.status]}>
              {DatasetStatusMap[dataset.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建人">{dataset.createdBy}</Descriptions.Item>
          <Descriptions.Item label="已发布版本">
            {dataset.publishedVersion ? `v${dataset.publishedVersion}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="当前版本">
            {dataset.currentVersion ? `v${dataset.currentVersion}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {dataset.description}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {dayjs(dataset.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'fields',
      label: '字段信息',
      children: dataset?.fields && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span>
              共 {dataset.fields.length} 个字段，其中敏感字段{' '}
              {dataset.fields.filter((f) => f.isSensitive).length} 个
            </span>
            {dataset.status === 'DRAFT' && role === 'BUSINESS' && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/datasets/${datasetId}/fields`)}
              >
                编辑字段
              </Button>
            )}
          </div>
          <Table
            rowKey="id"
            columns={fieldColumns}
            dataSource={dataset.fields}
            pagination={false}
            size="small"
          />
        </div>
      ),
    },
    {
      key: 'versions',
      label: (
        <span>
          <HistoryOutlined /> 版本管理
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setVersionModalOpen(true)}
            >
              创建新版本
            </Button>
          </div>
          <Table
            rowKey="id"
            columns={versionColumns}
            dataSource={versions}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: 'reviews',
      label: (
        <span>
          <SafetyCertificateOutlined /> 审查记录
        </span>
      ),
      children: (
        <div>
          {reviews.length > 0 ? (
            <Timeline
              items={reviews.map((review) => ({
                color:
                  review.reviewStatus === 'APPROVED'
                    ? 'green'
                    : review.reviewStatus === 'REJECTED'
                    ? 'red'
                    : review.reviewStatus === 'NEEDS_REVISION'
                    ? 'orange'
                    : 'blue',
                children: (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <div className="flex-between mb-16">
                      <Space>
                        <Tag color={ReviewStatusColorMap[review.reviewStatus as keyof typeof ReviewStatusColorMap]}>
                          {ReviewStatusMap[review.reviewStatus as keyof typeof ReviewStatusMap]}
                        </Tag>
                        <span style={{ fontWeight: 500 }}>
                          {ReviewTypeMap[review.reviewType as keyof typeof ReviewTypeMap]}
                        </span>
                      </Space>
                      <span className="text-muted text-small">
                        {dayjs(review.createdAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                    {review.versionNumber && (
                      <div className="text-small text-muted mb-16">
                        版本: v{review.versionNumber}
                      </div>
                    )}
                    {review.reviewOpinion && (
                      <div>
                        <div className="text-small text-muted">审查意见：</div>
                        <div>{review.reviewOpinion}</div>
                      </div>
                    )}
                    {review.reviewer && (
                      <div className="text-small text-muted mt-16">
                        审查人：{review.reviewer}
                      </div>
                    )}
                  </Card>
                ),
              }))}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#8c8c8c' }}>
              暂无审查记录
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/datasets')}
          >
            返回
          </Button>
          <h2 className="page-title">{dataset?.name || '数据集详情'}</h2>
          {dataset && (
            <Tag color={DatasetStatusColorMap[dataset.status]}>
              {DatasetStatusMap[dataset.status]}
            </Tag>
          )}
        </Space>
        <Space>
          {dataset?.status === 'DRAFT' && role === 'BUSINESS' && (
            <>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/datasets/${datasetId}/fields`)}>
                编辑字段
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => datasetApi.submitForReview(datasetId)}
              >
                提交审查
              </Button>
            </>
          )}
        </Space>
      </div>

      <Card loading={loading}>
        <Tabs defaultActiveKey="info" items={tabItems} />
      </Card>

      <Modal
        title="创建新版本"
        open={versionModalOpen}
        onCancel={() => setVersionModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVersion}>
          <Form.Item name="versionName" label="版本名称">
            <FormInput placeholder="请输入版本名称，如：年度更新版本" />
          </Form.Item>
          <Form.Item name="changeDescription" label="变更说明">
            <FormInput.TextArea
              rows={4}
              placeholder="请详细描述本次版本的变更内容..."
            />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setVersionModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default DatasetDetail
