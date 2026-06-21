import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Tabs,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import type { PublishWindow } from '@/types'
import {
  WindowStatusMap,
  WindowStatusColorMap,
  PublishTypeMap,
} from '@/types'
import { publishWindowApi } from '@/api'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const WindowManagement = () => {
  const [windows, setWindows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingWindow, setEditingWindow] = useState<PublishWindow | null>(null)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('all')

  const loadWindows = async () => {
    setLoading(true)
    try {
      const result = await publishWindowApi.getAll({ page: 0, size: 100 })
      setWindows(result.content || [])
    } catch (error: any) {
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWindows()
  }, [])

  const handleAdd = () => {
    setEditingWindow(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: PublishWindow) => {
    setEditingWindow(record)
    form.setFieldsValue({
      ...record,
      timeRange: [dayjs(record.windowStart), dayjs(record.windowEnd)],
    })
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      const { timeRange, ...rest } = values

      const windowData = {
        ...rest,
        windowStart: timeRange[0].toISOString(),
        windowEnd: timeRange[1].toISOString(),
      }

      if (editingWindow) {
        await publishWindowApi.update(editingWindow.id, windowData)
        message.success('更新成功')
      } else {
        await publishWindowApi.create(windowData)
        message.success('创建成功')
      }

      setModalOpen(false)
      form.resetFields()
      loadWindows()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleActivate = async (id: number) => {
    Modal.confirm({
      title: '确认激活',
      content: '激活后发布窗口将立即生效，是否继续？',
      onOk: async () => {
        try {
          await publishWindowApi.activate(id)
          message.success('已激活')
          loadWindows()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const handleClose = async (id: number) => {
    Modal.confirm({
      title: '确认关闭',
      content: '关闭后将无法再发布数据集，是否继续？',
      onOk: async () => {
        try {
          await publishWindowApi.close(id)
          message.success('已关闭')
          loadWindows()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const handleCancel = async (id: number) => {
    Modal.confirm({
      title: '确认取消',
      content: '取消后该发布窗口将不再可用，是否继续？',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await publishWindowApi.cancel(id)
          message.success('已取消')
          loadWindows()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      },
    })
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个发布窗口吗？',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await publishWindowApi.remove(id)
          message.success('删除成功')
          loadWindows()
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      },
    })
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: PublishWindow) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.description && (
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>{record.description}</span>
          )}
          {record.remark && (
            <span style={{ color: '#fa8c16', fontSize: 12 }}>备注：{record.remark}</span>
          )}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'publishType',
      key: 'publishType',
      width: 100,
      render: (type: string) => PublishTypeMap[type as keyof typeof PublishTypeMap] || type,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={WindowStatusColorMap[status as keyof typeof WindowStatusColorMap]}>
          {WindowStatusMap[status as keyof typeof WindowStatusMap]}
        </Tag>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'windowStart',
      key: 'windowStart',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '结束时间',
      dataIndex: 'windowEnd',
      key: 'windowEnd',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '发布进度',
      key: 'progress',
      width: 160,
      render: (_: any, record: PublishWindow) => (
        <span>
          {record.publishedCount || 0} / {record.maxDatasets || '不限'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      fixed: 'right' as const,
      render: (_: any, record: PublishWindow) => (
        <Space size="small">
          {record.status === 'PLANNED' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleActivate(record.id)}
              >
                激活
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
          {record.status === 'ACTIVE' && (
            <Button
              type="link"
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleClose(record.id)}
            >
              关闭
            </Button>
          )}
          {(record.status === 'PLANNED' || record.status === 'ACTIVE') && (
            <Button
              type="link"
              size="small"
              onClick={() => handleCancel(record.id)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const getFilteredWindows = (status?: string) => {
    if (!status || status === 'all') return windows
    return windows.filter((w) => w.status === status)
  }

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'PLANNED', label: '计划中' },
    { key: 'ACTIVE', label: '进行中' },
    { key: 'CLOSED', label: '已关闭' },
    { key: 'CANCELLED', label: '已取消' },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">发布窗口管理</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建发布窗口
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={getFilteredWindows(activeTab)}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingWindow ? '编辑发布窗口' : '新建发布窗口'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="窗口标题"
            rules={[{ required: true, message: '请输入窗口标题' }]}
          >
            <Input placeholder="请输入窗口标题" />
          </Form.Item>
          <Form.Item name="description" label="窗口描述">
            <TextArea rows={2} placeholder="请输入窗口描述" />
          </Form.Item>
          <Form.Item name="remark" label="发布备注">
            <TextArea rows={2} placeholder="请填写发布说明，如延后或提前发布的原因" />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="发布时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <RangePicker
              showTime
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
          <Form.Item
            name="publishType"
            label="发布类型"
            rules={[{ required: true, message: '请选择发布类型' }]}
          >
            <Select placeholder="请选择发布类型">
              <Option value="ROUTINE">常规发布</Option>
              <Option value="EMERGENCY">应急发布</Option>
              <Option value="SPECIAL">专项发布</Option>
            </Select>
          </Form.Item>
          <Form.Item name="maxDatasets" label="最大数据集数量">
            <InputNumber min={1} style={{ width: 200 }} placeholder="不填则不限制" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WindowManagement
