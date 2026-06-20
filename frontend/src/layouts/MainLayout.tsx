import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import {
  AppstoreOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import { UserRoleMap } from '@/types'
import { useState } from 'react'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, realName, department, logout } = useUserStore()
  const [collapsed, setCollapsed] = useState(false)

  const getMenuItems = () => {
    const items: any[] = []

    if (role === 'BUSINESS') {
      items.push({
        key: '/datasets',
        icon: <DatabaseOutlined />,
        label: <Link to="/datasets">我的数据集</Link>,
      })
    }

    if (role === 'DATA_OFFICE') {
      items.push({
        key: '/reviews',
        icon: <SafetyCertificateOutlined />,
        label: <Link to="/reviews">脱敏审查</Link>,
      })
    }

    if (role === 'ADMIN') {
      items.push(
        {
          key: '/datasets',
          icon: <DatabaseOutlined />,
          label: <Link to="/datasets">数据集管理</Link>,
        },
        {
          key: '/reviews',
          icon: <SafetyCertificateOutlined />,
          label: <Link to="/reviews">审查管理</Link>,
        },
        {
          key: '/windows',
          icon: <CalendarOutlined />,
          label: <Link to="/windows">发布窗口</Link>,
        }
      )
    }

    return items
  }

  const userMenuItems = [
    {
      key: 'public',
      icon: <AppstoreOutlined />,
      label: '公众端',
      onClick: () => navigate('/public/datasets'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AppstoreOutlined style={{ color: '#fff', fontSize: 24 }} />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>政务数据开放平台</span>
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
            管理后台 | {UserRoleMap[role]}
          </span>
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', color: '#fff' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{realName}</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{department}</span>
          </Space>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          width={220}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content style={{ margin: 0, background: '#f5f5f5' }}>
          <div style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
