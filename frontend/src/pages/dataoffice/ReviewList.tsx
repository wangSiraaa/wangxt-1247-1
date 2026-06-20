import { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Input,
  Select,
  Space,
  Card,
  Button,
  Badge,
  Tabs,
} from 'antd'
import {
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ReviewRecord } from '@/types'
import {
  ReviewStatusMap,
  ReviewStatusColorMap,
  ReviewTypeMap,
  DatasetStatusMap,
} from '@/types'
import { reviewApi, datasetApi } from '@/api'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

const ReviewList = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<any[]>([])
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('PENDING')

  const loadReviews = async (status: string) => {
    setLoading(true)
    try {
      if (status === 'all') {
        const result = await reviewApi.getByStatus('IN_PROGRESS', { page: 0, size: 50 })
        setReviews(result.content || [])
      } else {
        const result = await reviewApi.getByStatus(status, { page: 0, size: 50 })
        setReviews(result.content || [])
      }
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmittedDatasets = async () => {
    try {
      const result = await datasetApi.getByStatus('SUBMITTED', { page: 0, size: 50 })
      setDatasets(result.content || [])
    } catch (error: any) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadReviews(activeTab)
    loadSubmittedDatasets()
  }, [activeTab])

  const columns = [
    {
      title: '数据集名称',
      dataIndex: 'datasetName',
      key: 'datasetName',
      render: (_: string, record: any) => (
        <a onClick={() => navigate(`/reviews/${record.id}`)}>{record.dataset?.name || '未知数据集'}</a>
      ),
    },
    {
      title: '版本号',
      dataIndex: 'versionNumber',
      key: 'versionNumber',
      width: 100,
      render: (v: string) => (v ? `v${v}` : '-'),
    },
    {
      title: '审查类型',
      dataIndex: 'reviewType',
      key: 'reviewType',
      width: 120,
      render: (type: string) => ReviewTypeMap[type as keyof typeof ReviewTypeMap] || type,
    },
    {
      title: '状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 120,
      render: (status: string) => (
        <Tag color={ReviewStatusColorMap[status as keyof typeof ReviewStatusColorMap]}>
          {ReviewStatusMap[status as keyof typeof ReviewStatusMap]}
        </Tag>
      ),
    },
    {
      title: '敏感字段数',
      dataIndex: 'sensitiveFieldCount',
      key: 'sensitiveFieldCount',
      width: 110,
      render: (count: number) => count || 0,
    },
    {
      title: '高风险字段',
      dataIndex: 'highRiskFieldCount',
      key: 'highRiskFieldCount',
      width: 110,
      render: (count: number) =>
        count ? <Badge count={count} color="red" /> : 0,
    },
    {
      title: '审查人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 120,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/reviews/${record.id}`)}
        >
          处理
        </Button>
      ),
    },
  ]

  const submittedColumns = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/datasets/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '数据集编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color="processing">{DatasetStatusMap[status as keyof typeof DatasetStatusMap]}</Tag>
      ),
    },
    {
      title: '当前版本',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 100,
      render: (v: string) => (v ? `v${v}` : '-'),
    },
    {
      title: '提交时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<SafetyCertificateOutlined />}
          onClick={() => {
            reviewApi
              .startDesensitizationReview(record.id)
              .then((res) => {
                navigate(`/reviews/${res.id}`)
              })
              .catch((err) => {
                console.error(err)
              })
          }}
        >
          开始审查
        </Button>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'PENDING',
      label: (
        <span>
        <ClockCircleOutlined /> 待处理
      </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              <Search placeholder="搜索数据集名称" allowClear style={{ width: 280 }} />
              <Select placeholder="审查类型" allowClear style={{ width: 160 }}>
                <Option value="DESENSITIZATION">脱敏审查</Option>
                <Option value="SECURITY">安全审查</Option>
                <Option value="LEGAL">合规审查</Option>
              </Select>
            </Space>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>待开始审查的数据集</div>
            <Table
              rowKey="id"
              columns={submittedColumns}
              dataSource={datasets}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'IN_PROGRESS',
      label: (
        <span>
          <SafetyCertificateOutlined /> 审查中
        </span>
      ),
      children: (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={reviews}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'APPROVED',
      label: (
        <span>
          <CheckCircleOutlined /> 已通过
        </span>
      ),
      children: (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={reviews}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'REJECTED',
      label: (
        <span>
          <CloseCircleOutlined /> 已驳回
        </span>
      ),
      children: (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={reviews}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'NEEDS_REVISION',
      label: '需修改',
      children: (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={reviews}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">脱敏审查</h2>
        <Space>
          <Button>导出</Button>
        </Space>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  )
}

export default ReviewList
