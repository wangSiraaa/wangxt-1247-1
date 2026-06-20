import { useState, useEffect, useRef } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Drawer,
  Tag,
  Divider,
  Popconfirm,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { DatasetField, Dataset } from '@/types'
import { SensitivityLevelMap, DesensitizationTypeMap } from '@/types'
import { datasetApi } from '@/api'

const { TextArea } = Input
const { Option } = Select

const FieldEditor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [fields, setFields] = useState<DatasetField[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<DatasetField | null>(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const tableRef = useRef<any>(null)

  const datasetId = Number(id)

  const loadData = async () => {
    setLoading(true)
    try {
      const [datasetData, fieldData] = await Promise.all([
        datasetApi.getById(datasetId),
        datasetApi.getFields(datasetId),
      ])
      setDataset(datasetData)
      setFields(fieldData || [])
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

  const handleAdd = () => {
    setEditingField(null)
    form.resetFields()
    form.setFieldsValue({
      isSensitive: false,
      sortOrder: fields.length + 1,
      dataType: 'VARCHAR(100)',
    })
    setModalOpen(true)
  }

  const handleEdit = (field: DatasetField) => {
    setEditingField(field)
    form.setFieldsValue(field)
    setModalOpen(true)
  }

  const handleDelete = (fieldId: number) => {
    setFields(fields.filter((f) => f.id !== fieldId))
    message.success('已标记删除，保存后生效')
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingField) {
        setFields(
          fields.map((f) =>
            f.id === editingField.id ? { ...f, ...values, isModified: true } : f
          )
        )
      } else {
        const newField: DatasetField = {
          ...values,
          id: Date.now() + Math.random(),
          isNew: true,
          isModified: true,
        } as any
        setFields([...fields, newField])
      }
      setModalOpen(false)
      form.resetFields()
    } catch {
      // 校验失败
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await datasetApi.saveFields(datasetId, fields)
      message.success('保存成功')
      loadData()
    } catch (error: any) {
      message.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSensitiveChange = (isSensitive: boolean) => {
    if (isSensitive) {
      form.setFieldsValue({
        sensitivityLevel: 'MEDIUM',
        desensitizationType: 'MASKING',
      })
    } else {
      form.setFieldsValue({
        sensitivityLevel: undefined,
        desensitizationType: undefined,
        desensitizationRule: undefined,
      })
    }
  }

  const columns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 140,
      render: (text: string, record: DatasetField) => (
        <span>
          {text}
          {record.isNew && <Tag color="green" style={{ marginLeft: 4 }}>新增</Tag>}
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
      width: 140,
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
      width: 180,
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
      render: (level: string) => (level ? SensitivityLevelMap[level as keyof typeof SensitivityLevelMap] : '-'),
    },
    {
      title: '脱敏方式',
      dataIndex: 'desensitizationType',
      key: 'desensitizationType',
      width: 110,
      render: (type: string) =>
        type ? DesensitizationTypeMap[type as keyof typeof DesensitizationTypeMap] : '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: DatasetField) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该字段吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
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
            onClick={() => navigate(`/datasets/${datasetId}`)}
          >
            返回详情
          </Button>
          <h2 className="page-title">字段管理 - {dataset?.name}</h2>
          <Tag>{fields.length} 个字段</Tag>
        </Space>
        <Space>
          <Button icon={<UploadOutlined />}>导入字段</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加字段
            </Button>
          </Space>
        </div>

        <Table
          ref={tableRef}
          rowKey="id"
          columns={columns}
          dataSource={fields}
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        <Divider orientation="left">字段说明</Divider>
        <div style={{ color: '#8c8c8c', fontSize: 13, lineHeight: 1.8 }}>
          <p>• <strong>字段名称</strong>：字段的中文显示名称，用于界面展示</p>
          <p>• <strong>字段编码</strong>：字段的英文标识，用于程序处理，建议使用下划线命名法</p>
          <p>• <strong>样例数据</strong>：提供字段的示例数据，帮助公众理解数据含义</p>
          <p>• <strong>敏感字段</strong>：涉及个人隐私或敏感信息的字段需要标记并设置脱敏规则</p>
          <p>• <strong>脱敏规则</strong>：数据发布前将按照设置的脱敏规则对敏感字段进行处理</p>
        </div>
      </Card>

      <Modal
        title={editingField ? '编辑字段' : '添加字段'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fieldName"
            label="字段名称"
            rules={[{ required: true, message: '请输入字段名称' }]}
          >
            <Input placeholder="请输入字段名称" />
          </Form.Item>
          <Form.Item
            name="fieldCode"
            label="字段编码"
            rules={[{ required: true, message: '请输入字段编码' }]}
          >
            <Input placeholder="请输入字段编码，如 user_name" />
          </Form.Item>
          <Form.Item
            name="dataType"
            label="数据类型"
            rules={[{ required: true, message: '请选择数据类型' }]}
          >
            <Select placeholder="请选择数据类型">
              <Option value="VARCHAR(50)">VARCHAR(50) 短文本</Option>
              <Option value="VARCHAR(100)">VARCHAR(100) 中文本</Option>
              <Option value="VARCHAR(200)">VARCHAR(200) 长文本</Option>
              <Option value="VARCHAR(500)">VARCHAR(500) 超长文本</Option>
              <Option value="TEXT">TEXT 大文本</Option>
              <Option value="INTEGER">INTEGER 整数</Option>
              <Option value="BIGINT">BIGINT 长整数</Option>
              <Option value="DECIMAL(18,2)">DECIMAL(18,2) 金额</Option>
              <Option value="DATE">DATE 日期</Option>
              <Option value="DATETIME">DATETIME 日期时间</Option>
              <Option value="BOOLEAN">BOOLEAN 布尔</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="字段描述">
            <TextArea rows={2} placeholder="请输入字段描述" />
          </Form.Item>
          <Form.Item name="sampleData" label="样例数据">
            <Input placeholder="请输入样例数据" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={1} style={{ width: 120 }} />
          </Form.Item>

          <Divider orientation="left">敏感信息配置</Divider>

          <Form.Item name="isSensitive" label="是否为敏感字段" valuePropName="checked">
            <Select
              onChange={handleSensitiveChange}
              placeholder="请选择"
              style={{ width: 120 }}
            >
              <Option value={false}>否</Option>
              <Option value={true}>是</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.isSensitive !== cur.isSensitive}
          >
            {({ getFieldValue }) =>
              getFieldValue('isSensitive') ? (
                <>
                  <Form.Item name="sensitivityLevel" label="敏感度级别">
                    <Select placeholder="请选择敏感度级别">
                      <Option value="LOW">低 - 一般个人信息</Option>
                      <Option value="MEDIUM">中 - 重要个人信息</Option>
                      <Option value="HIGH">高 - 敏感个人信息</Option>
                      <Option value="CRITICAL">极高 - 核心敏感信息</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="desensitizationType" label="脱敏方式">
                    <Select placeholder="请选择脱敏方式">
                      <Option value="MASKING">掩码 - 部分字符用*代替</Option>
                      <Option value="REPLACEMENT">替换 - 用指定字符替换</Option>
                      <Option value="HASHING">哈希 - 不可逆加密</Option>
                      <Option value="ENCRYPTION">加密 - 可逆加密</Option>
                      <Option value="AGGREGATION">聚合 - 统计汇总</Option>
                      <Option value="CUSTOM">自定义规则</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="desensitizationRule" label="脱敏规则说明">
                    <TextArea rows={2} placeholder="请描述具体的脱敏规则" />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FieldEditor
