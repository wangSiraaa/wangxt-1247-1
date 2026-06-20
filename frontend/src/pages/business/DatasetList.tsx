import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Tag,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Input as FormInput,
  message,
  Card,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  SendOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Dataset, DatasetStatus } from '@/types'
import { DatasetStatusMap, DatasetStatusColorMap } from '@/types'
import { datasetApi } from '@/api'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

const DatasetList = () => {
  const navigate = useNavigate()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [keyword, setKeyword] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  const loadDatasets = async () => {
    setLoading(true)
    try {
      const result = await datasetApi.getAll({ page: 0, size: 50 })
      setDatasets(result.content || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDatasets()
  }, [])

  const handleCreate = async (values: any) => {
    try {
      await datasetApi.create({ ...values, createdBy: 'business' })
      message.success('创建成功')
      setCreateModalOpen(false)
      form.resetFields()
      loadDatasets()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    }
  }

  const handleSubmit = async (id: number) => {
    Modal.confirm({
      title: '确认提交审查',
      content: '提交后数据集状态将变为"已提交"，等待数据办进行脱敏审查。是否继续？',
      okText: '确认提交',
      okButtonProps: { type: 'primary' },
      cancelText: '取消',
      onOk: async () => {
        try {
          await datasetApi.submitForReview(id)
          message.success('提交成功')
          loadDatasets()
        } catch (error: any) {
          message.error(error.message || '提交失败')
        }
      },
    })
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个数据集吗？此操作不可恢复。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await datasetApi.remove(id)
          message.success('删除成功')
          loadDatasets()
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      },
    })
  }

  const columns = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Dataset) => (
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
      render: (status: DatasetStatus) => (
        <Tag color={DatasetStatusColorMap[status]}>{DatasetStatusMap[status]}</Tag>
      ),
    },
    {
      title: '当前版本',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 100,
    },
    {
      title: '更新频率',
      dataIndex: 'updateFrequency',
      key: 'updateFrequency',
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
      title: '操作',
      key: 'actions',
      width: 240,
      render: (_: any, record: Dataset) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/datasets/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'DRAFT' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/datasets/${record.id}/fields`)}
              >
                编辑字段
              </Button>
              <Button
                type="link"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSubmit(record.id)}
              >
                提交审查
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">我的数据集</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            新建数据集
          </Button>
        </Space>
      </div>

      <Card className="mb-16">
        <Space wrap>
          <Search
            placeholder="搜索数据集名称/编码"
            allowClear
            style={{ width: 280 }}
            onSearch={setKeyword}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 160 }}
            value={statusFilter || undefined}
            onChange={setStatusFilter}
          >
            {Object.entries(DatasetStatusMap).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={datasets}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新建数据集"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <FormInput placeholder="请输入数据集名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="数据集编码"
            rules={[{ required: true, message: '请输入数据集编码' }]}
          >
            <FormInput placeholder="请输入数据集编码，如 POP-001" />
          </Form.Item>
          <Form.Item name="category" label="数据分类">
            <Select placeholder="请选择数据分类">
              <Option value="人口统计">人口统计</Option>
              <Option value="企业信息">企业信息</Option>
              <Option value="教育统计">教育统计</Option>
              <Option value="经济统计">经济统计</Option>
              <Option value="社会保障">社会保障</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="所属部门">
            <FormInput placeholder="请输入所属部门" />
          </Form.Item>
          <Form.Item name="dataSource" label="数据来源">
            <FormInput placeholder="请输入数据来源系统" />
          </Form.Item>
          <Form.Item name="updateFrequency" label="更新频率">
            <Select placeholder="请选择更新频率">
              <Option value="实时">实时</Option>
              <Option value="日更">日更</Option>
              <Option value="周更">周更</Option>
              <Option value="月度">月度</Option>
              <Option value="季度">季度</Option>
              <Option value="年度">年度</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="数据集描述">
            <FormInput.TextArea rows={3} placeholder="请简要描述数据集内容和用途" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DatasetList
