import { useState, useEffect } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Divider,
  Drawer,
  Badge,
  Statistic,
  Row,
  Col,
  Tabs,
} from 'antd'
import {
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { ReviewRecord, DatasetField, DatasetVersion } from '@/types'
import {
  ReviewStatusMap,
  ReviewStatusColorMap,
  ReviewTypeMap,
  SensitivityLevelMap,
  SensitivityLevelColorMap,
  DesensitizationTypeMap,
  VersionStatusMap,
  VersionStatusColorMap,
} from '@/types'
import { reviewApi, versionApi, datasetApi } from '@/api'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [review, setReview] = useState<ReviewRecord | null>(null)
  const [version, setVersion] = useState<DatasetVersion | null>(null)
  const [fields, setFields] = useState<DatasetField[]>([])
  const [loading, setLoading] = useState(false)
  const [fieldModalOpen, setFieldModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<DatasetField | null>(null)
  const [form] = Form.useForm()
  const [opinionModalOpen, setOpinionModalOpen] = useState<'approve' | 'reject' | 'revision' | null>(null)
  const [opinionForm] = Form.useForm()

  const reviewId = Number(id)

  const loadData = async () => {
    setLoading(true)
    try {
      const reviewData = await reviewApi.getById(reviewId)
      setReview(reviewData)

      if (reviewData.versionId) {
        const versionData = await versionApi.getById(reviewData.versionId)
        setVersion(versionData)
        setFields(versionData.fields || [])
      }
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reviewId) {
      loadData()
    }
  }, [reviewId])

  const handleEditField = (field: DatasetField) => {
    setEditingField(field)
    form.setFieldsValue(field)
    setFieldModalOpen(true)
  }

  const handleFieldModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingField) {
        setFields(
          fields.map((f) =>
            f.id === editingField.id ? { ...f, ...values, isModified: true } : f
          )
        )
      }
      setFieldModalOpen(false)
      message.success('字段配置已更新')
    } catch {
      // 校验失败
    }
  }

  const handleApprove = () => {
    opinionForm.resetFields()
    setOpinionModalOpen('approve')
  }

  const handleReject = () => {
    opinionForm.resetFields()
    setOpinionModalOpen('reject')
  }

  const handleRevision = () => {
    opinionForm.resetFields()
    setOpinionModalOpen('revision')
  }

  const handleOpinionOk = async () => {
    try {
      const values = await opinionForm.validateFields()
      let apiCall

      if (opinionModalOpen === 'approve') {
        apiCall = reviewApi.approve(reviewId, 'dataoffice', values.opinion)
      } else if (opinionModalOpen === 'reject') {
        apiCall = reviewApi.reject(reviewId, 'dataoffice', values.opinion)
      } else {
        apiCall = reviewApi.requestRevision(reviewId, 'dataoffice', values.opinion)
      }

      await apiCall
      message.success('操作成功')
      setOpinionModalOpen(null)
      loadData()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const sensitiveFields = fields.filter((f) => f.isSensitive)
  const highRiskFields = fields.filter(
    (f) => f.isSensitive && (f.sensitivityLevel === 'HIGH' || f.sensitivityLevel === 'CRITICAL')
  )

  const fieldColumns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 150,
      render: (text: string, record: DatasetField) => (
        <span>
          {text}
          {record.isSensitive && (
            <Badge dot color="red" offset={[4, 0]} style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
    },
    {
      title: '字段编码',
      dataIndex: 'fieldCode',
      key: 'fieldCode',
      width: 160,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 130,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '样例数据',
      dataIndex: 'sampleData',
      key: 'sampleData',
      width: 200,
      ellipsis: true,
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
      width: 110,
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
    {
      title: '脱敏规则',
      dataIndex: 'desensitizationRule',
      key: 'desensitizationRule',
      width: 180,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: DatasetField) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditField(record)}
        >
          配置
        </Button>
      ),
    },
  ]

  const sensitiveColumns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 140,
    },
    {
      title: '字段编码',
      dataIndex: 'fieldCode',
      key: 'fieldCode',
      width: 150,
    },
    {
      title: '敏感度级别',
      dataIndex: 'sensitivityLevel',
      key: 'sensitivityLevel',
      width: 110,
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
        type ? DesensitizationTypeMap[type as keyof typeof DesensitizationTypeMap] : '未设置',
    },
    {
      title: '脱敏规则',
      dataIndex: 'desensitizationRule',
      key: 'desensitizationRule',
      ellipsis: true,
    },
  ]

  const tabItems = [
    {
      key: 'all',
      label: `全部字段 (${fields.length})`,
      children: (
        <Table
          rowKey="id"
          columns={fieldColumns}
          dataSource={fields}
          pagination={{ pageSize: 10 }}
          size="small"
          scroll={{ x: 1300 }}
        />
      ),
    },
    {
      key: 'sensitive',
      label: (
        <span>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> 敏感字段 ({sensitiveFields.length})
        </span>
      ),
      children: (
        <div>
          {sensitiveFields.length > 0 ? (
            <Table
              rowKey="id"
              columns={sensitiveColumns}
              dataSource={sensitiveFields}
              pagination={false}
              size="small"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#8c8c8c' }}>
              暂无敏感字段
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'highRisk',
      label: (
        <span>
          <ExclamationCircleOutlined style={{ color: '#eb2f96' }} /> 高风险字段 ({highRiskFields.length})
        </span>
      ),
      children: (
        <div>
          {highRiskFields.length > 0 ? (
            <Table
              rowKey="id"
              columns={sensitiveColumns}
              dataSource={highRiskFields}
              pagination={false}
              size="small"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#8c8c8c' }}>
              暂无高风险字段
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
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/reviews')}>
            返回
          </Button>
          <h2 className="page-title">脱敏审查详情</h2>
          {review && (
            <Tag color={ReviewStatusColorMap[review.reviewStatus as keyof typeof ReviewStatusColorMap]}>
              {ReviewStatusMap[review.reviewStatus as keyof typeof ReviewStatusMap]}
            </Tag>
          )}
        </Space>
        <Space>
          {review?.reviewStatus === 'IN_PROGRESS' && (
            <>
              <Button icon={<CloseCircleOutlined />} danger onClick={handleReject}>
                驳回
              </Button>
              <Button icon={<EditOutlined />} onClick={handleRevision}>
                要求修改
              </Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApprove}>
                通过审查
              </Button>
            </>
          )}
        </Space>
      </div>

      <Row gutter={16} className="mb-16">
        <Col span={6}>
          <Card>
            <Statistic
              title="字段总数"
              value={fields.length}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="敏感字段"
              value={sensitiveFields.length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高风险字段"
              value={highRiskFields.length}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已配置脱敏"
              value={sensitiveFields.filter((f) => f.desensitizationType && f.desensitizationType !== 'NONE').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card loading={loading} className="mb-16">
        <Descriptions title="审查信息" bordered column={2} size="small">
          <Descriptions.Item label="审查类型">
            {review && ReviewTypeMap[review.reviewType as keyof typeof ReviewTypeMap]}
          </Descriptions.Item>
          <Descriptions.Item label="审查状态">
            {review && (
              <Tag color={ReviewStatusColorMap[review.reviewStatus as keyof typeof ReviewStatusColorMap]}>
                {ReviewStatusMap[review.reviewStatus as keyof typeof ReviewStatusMap]}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="审查版本">
            {version ? `v${version.versionNumber} - ${version.versionName}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="版本状态">
            {version && (
              <Tag color={VersionStatusColorMap[version.status as keyof typeof VersionStatusColorMap]}>
                {VersionStatusMap[version.status as keyof typeof VersionStatusMap]}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="审查人">{review?.reviewer || '-'}</Descriptions.Item>
          <Descriptions.Item label="审查时间">
            {review?.reviewDate ? dayjs(review.reviewDate).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="提交时间" span={2}>
            {review && dayjs(review.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          {review?.reviewOpinion && (
            <Descriptions.Item label="审查意见" span={2}>
              {review.reviewOpinion}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="字段审查" loading={loading}>
        <Tabs defaultActiveKey="all" items={tabItems} />
      </Card>

      <Modal
        title={editingField ? '配置字段脱敏' : '字段配置'}
        open={fieldModalOpen}
        onCancel={() => setFieldModalOpen(false)}
        onOk={handleFieldModalOk}
        width={560}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fieldName" label="字段名称">
            <Input disabled />
          </Form.Item>
          <Form.Item name="fieldCode" label="字段编码">
            <Input disabled />
          </Form.Item>

          <Divider orientation="left">敏感信息配置</Divider>

          <Form.Item
            name="isSensitive"
            label="是否为敏感字段"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select placeholder="请选择">
              <Option value={false}>否</Option>
              <Option value={true}>是</Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isSensitive !== cur.isSensitive}>
            {({ getFieldValue }) =>
              getFieldValue('isSensitive') ? (
                <>
                  <Form.Item
                    name="sensitivityLevel"
                    label="敏感度级别"
                    rules={[{ required: true, message: '请选择敏感度级别' }]}
                  >
                    <Select placeholder="请选择敏感度级别">
                      <Option value="LOW">低 - 一般个人信息</Option>
                      <Option value="MEDIUM">中 - 重要个人信息</Option>
                      <Option value="HIGH">高 - 敏感个人信息</Option>
                      <Option value="CRITICAL">极高 - 核心敏感信息</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="desensitizationType"
                    label="脱敏方式"
                    rules={[{ required: true, message: '请选择脱敏方式' }]}
                  >
                    <Select placeholder="请选择脱敏方式">
                      <Option value="NONE">不脱敏</Option>
                      <Option value="MASKING">掩码 - 部分字符用*代替</Option>
                      <Option value="REPLACEMENT">替换 - 用指定字符替换</Option>
                      <Option value="HASHING">哈希 - 不可逆加密</Option>
                      <Option value="ENCRYPTION">加密 - 可逆加密</Option>
                      <Option value="AGGREGATION">聚合 - 统计汇总</Option>
                      <Option value="CUSTOM">自定义规则</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="desensitizationRule" label="脱敏规则说明">
                    <TextArea rows={3} placeholder="请描述具体的脱敏规则" />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          opinionModalOpen === 'approve'
            ? '通过审查'
            : opinionModalOpen === 'reject'
            ? '驳回审查'
            : '要求修改'
        }
        open={!!opinionModalOpen}
        onCancel={() => setOpinionModalOpen(null)}
        onOk={handleOpinionOk}
        okText="确认"
        cancelText="取消"
        okButtonProps={{
          danger: opinionModalOpen === 'reject',
          type: opinionModalOpen === 'approve' ? 'primary' : 'default',
        }}
        width={520}
      >
        <Form form={opinionForm} layout="vertical">
          <Form.Item
            name="opinion"
            label="审查意见"
            rules={[{ required: true, message: '请填写审查意见' }]}
          >
            <TextArea
              rows={5}
              placeholder={
                opinionModalOpen === 'approve'
                  ? '请填写通过审查的意见...'
                  : opinionModalOpen === 'reject'
                  ? '请填写驳回的原因...'
                  : '请填写需要修改的具体内容...'
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ReviewDetail
