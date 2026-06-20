import { Layout, Menu, Button, Space } from 'antd'
import { AppstoreOutlined, DatabaseOutlined, LoginOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'

const { Header, Content, Footer } = Layout

const PublicLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/public/datasets',
      label: <Link to="/public/datasets">数据目录</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <DatabaseOutlined style={{ color: '#1677ff', fontSize: 28 }} />
          <span style={{ fontSize: 20, fontWeight: 600, color: '#262626' }}>政务数据开放平台</span>
        </div>
        <Space>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ borderBottom: 0, minWidth: 200 }}
          />
          <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/')}>
            管理后台
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: 'transparent' }}>
        政务数据开放平台 ©{new Date().getFullYear()} 数据管理办公室
      </Footer>
    </Layout>
  )
}

export default PublicLayout
