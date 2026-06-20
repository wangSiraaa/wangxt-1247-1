import { useState, useEffect } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Tabs,
  Table,
  Row,
  Col,
  Statistic,
  List,
  Space,
  Breadcrumb,
  Timeline,
} from 'antd'
import {
  ArrowLeftOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TagOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams, Link } from 'react-router-dom'
import type { Dataset, DatasetVersion, DatasetField } from '@/types'
import {
  SensitivityLevelMap,
  DesensitizationTypeMap,
} from '@/types'
import { datasetApi, versionApi } from '@/api'
import dayjs from 'dayjs'

const PublicDatasetDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [versions, setVersions] = useState<DatasetVersion[]>([])
  const [fields, setFields] = useState<DatasetField[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('fields')

  const datasetId = Number(id)

  const loadData = async () => {
    setLoading(true)
    try {
      const [datasetData, versionData] = await Promise.all([
        datasetApi.getById(datasetId),
        versionApi.getPublished(datasetId),
      ])
      setDataset(datasetData)
      setVersions(versionData || [])
      setFields(datasetData.fields || [])
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (datasetId) {
      loadData()
    }
  }, [datasetId])

  const fieldColumns = [
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 160,
    },
    {
      title: '字段编码',
      dataIndex: 'fieldCode',
      key: 'fieldCode',
      width: 180,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 140,
    },
    {
      title: '字段描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '样例数据',
      dataIndex: 'sampleData',
      key: 'sampleData',
      width: 220,
    },
    {
      title: '敏感等级',
      dataIndex: 'sensitivityLevel',
      key: 'sensitivityLevel',
      width: 100,
      render: (level: string) =>
        level && level !== 'NONE' ? (
          <Tag color="orange">{SensitivityLevelMap[level as keyof typeof SensitivityLevelMap]}</Tag>
        ) : (
          <Tag color="green">公开</Tag>
        ),
    },
    {
      title: '脱敏方式',
      dataIndex: 'desensitizationType',
      key: 'desensitizationType',
      width: 120,
      render: (type: string) =>
        type && type !== 'NONE'
          ? DesensitizationTypeMap[type as keyof typeof DesensitizationTypeMap]
          : '无',
    },
  ]

  const tabItems = [
    {
      key: 'fields',
      label: '数据字段',
      children: (
        <Table
          rowKey="id"
          columns={fieldColumns}
          dataSource={fields}
          pagination={false}
          size="middle"
          scroll={{ x: 1000 }}
        />
      ),
    },
    {
      key: 'versions',
      label: '版本历史',
      children: (
        <div>
          {versions.length > 0 ? (
            <Timeline
              items={versions.map((version) => ({
                color: 'blue',
                children: (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <div className="flex-between">
                      <Space>
                        <Tag color="green">已发布</Tag>
                        <span style={{ fontWeight: 500 }}>v{version.versionNumber}</span>
                        {version.versionName && <span className="text-muted">{version.versionName}</span>}
                      </Space>
                      <span className="text-muted text-small">
                        {dayjs(version.publishedAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                    {version.changeDescription && (
                      <div style={{ marginTop: 8 }}>
                        <div className="text-small text-muted mb-16">变更说明：</div>
                        <div>{version.changeDescription}</div>
                      </div>
                    )}
                    <div className="flex-between mt-16">
                      <Space size="large">
                        <span className="text-small text-muted">
                          <TagOutlined /> {version.fieldCount || 0} 个字段
                        </span>
                        {version.recordCount && (
                          <span className="text-small text-muted">
                            <DatabaseOutlined /> {version.recordCount.toLocaleString()} 条记录
                          </span>
                        )}
                      </Space>
                    </div>
                  </Card>
                ),
              }))}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#8c8c8c' }}>
              暂无版本记录
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'download',
      label: '数据下载',
      children: (
        <div style={{ padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <DownloadOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>数据下载说明</h3>
            <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
              该数据集已通过脱敏审查，可安全下载使用
            </p>
            <Space>
              <Button type="primary" icon={<DownloadOutlined />} size="large">
                下载 CSV 格式
              </Button>
              <Button icon={<DownloadOutlined />} size="large">
                下载 JSON 格式
              </Button>
              <Button icon={<DownloadOutlined />} size="large">
                下载 Excel 格式
              </Button>
            </Space>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/public/datasets">数据目录</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{dataset?.name || '数据集详情'}</Breadcrumb.Item>
      </Breadcrumb>

      <Card loading={loading} className="mb-16">
        <div className="flex-between mb-24">
          <Space direction="vertical" size="small">
            <Space>
              <DatabaseOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{dataset?.name}</h2>
            </Space>
            <Space>
              <Tag color="blue">{dataset?.category}</Tag>
              <Tag color="green">已发布</Tag>
              <span className="text-muted text-small">
                版本：v{dataset?.publishedVersion}
              </span>
            </Space>
          </Space>
          <Space>
            <Button icon={<EyeOutlined />} size="large">
              预览数据
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} size="large">
              下载数据
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]} className="mb-24">
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="数据字段数"
                value={fields.length}
                suffix="个"
                prefix={<TagOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="更新频率"
                value={dataset?.updateFrequency || '-'}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="提供部门"
                value={dataset?.department || '-'}
                prefix={<EnvironmentOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="最近更新"
                value={dataset?.updatedAt ? dayjs(dataset.updatedAt).format('YYYY-MM-DD') : '-'}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Descriptions title="基本信息" bordered column={2} size="small">
          <Descriptions.Item label="数据集编码">{dataset?.code}</Descriptions.Item>
          <Descriptions.Item label="数据来源">{dataset?.dataSource}</Descriptions.Item>
          <Descriptions.Item label="所属部门">{dataset?.department}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dataset?.createdAt && dayjs(dataset.createdAt).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="数据描述" span={2}>
            {dataset?.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  )
}

export default PublicDatasetDetail
