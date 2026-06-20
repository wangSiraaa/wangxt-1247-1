import { useState, useEffect } from 'react'
import {
  Card,
  Input,
  Select,
  Space,
  Tag,
  Button,
  Row,
  Col,
  Pagination,
  Empty,
  Statistic,
} from 'antd'
import {
  SearchOutlined,
  DatabaseOutlined,
  TagOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Dataset } from '@/types'
import { datasetApi } from '@/api'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

const PublicDatasetList = () => {
  const navigate = useNavigate()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 9

  const categories = [
    '人口统计',
    '企业信息',
    '教育统计',
    '经济统计',
    '社会保障',
    '其他',
  ]

  const loadDatasets = async () => {
    setLoading(true)
    try {
      const result = await datasetApi.getPublished(keyword, {
        page: page - 1,
        size: pageSize,
      })
      setDatasets(result.content || [])
      setTotal(result.totalElements || 0)
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDatasets()
  }, [keyword, category, page])

  const handleSearch = (value: string) => {
    setKeyword(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  return (
    <div>
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
        bodyStyle={{ padding: '40px 24px' }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h1 style={{ color: '#fff', fontSize: 32, marginBottom: 8 }}>
            政务数据开放平台
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 24 }}>
            政府数据资源一站式开放共享，让数据价值惠及社会公众
          </p>
          <Search
            placeholder="搜索数据集名称、描述..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 600, width: '100%' }}
            onSearch={handleSearch}
          />
        </div>
      </Card>

      <Row gutter={24}>
        <Col span={18}>
          <Card
            title="数据目录"
            extra={
              <Space>
                <Select
                  placeholder="数据分类"
                  allowClear
                  style={{ width: 150 }}
                  value={category || undefined}
                  onChange={handleCategoryChange}
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat}
                    </Option>
                  ))}
                </Select>
              </Space>
            }
          >
            {datasets.length > 0 ? (
              <Row gutter={[16, 16]}>
                {datasets.map((dataset) => (
                  <Col key={dataset.id} xs={24} sm={12} md={8}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/public/datasets/${dataset.id}`)}
                      style={{ height: '100%' }}
                      bodyStyle={{ padding: 20 }}
                    >
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <DatabaseOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 16,
                                color: '#262626',
                              }}
                            >
                              {dataset.name}
                            </span>
                          </div>
                          <Tag style={{ marginTop: 8 }} color="blue">
                            {dataset.category}
                          </Tag>
                        </div>

                        <div
                          style={{
                            color: '#595959',
                            fontSize: 13,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 40,
                          }}
                        >
                          {dataset.description}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: 8,
                            borderTop: '1px solid #f0f0f0',
                          }}
                        >
                          <Space size="small">
                            <TagOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                            <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                              v{dataset.publishedVersion}
                            </span>
                          </Space>
                          <Space size="small">
                            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                            <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                              {dayjs(dataset.updatedAt).format('YYYY-MM-DD')}
                            </span>
                          </Space>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无数据" style={{ padding: '60px 0' }} />
            )}

            {total > 0 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col span={6}>
          <Card title="数据分类" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {categories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => handleCategoryChange(category === cat ? '' : cat)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: category === cat ? '#e6f4ff' : 'transparent',
                    color: category === cat ? '#1677ff' : '#262626',
                  }}
                >
                  {cat}
                </div>
              ))}
            </Space>
          </Card>

          <Card title="数据统计">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="数据集" value={total} />
              </Col>
              <Col span={12}>
                <Statistic title="分类数" value={categories.length} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PublicDatasetList
