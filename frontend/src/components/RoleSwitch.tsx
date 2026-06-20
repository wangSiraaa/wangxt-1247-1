import { Dropdown, Button } from 'antd'
import { UserOutlined, SwapOutlined } from '@ant-design/icons'
import { useUserStore } from '@/store/user'
import { UserRoleMap, UserRole } from '@/types'

const RoleSwitch = () => {
  const { role, realName, setUser } = useUserStore()

  const roleOptions: { label: string; key: UserRole }[] = [
    { label: '业务处室', key: 'BUSINESS' },
    { label: '数据办', key: 'DATA_OFFICE' },
    { label: '管理员', key: 'ADMIN' },
  ]

  const handleRoleChange = (key: UserRole) => {
    const userMap: Record<UserRole, { username: string; realName: string; department: string }> = {
      BUSINESS: { username: 'business', realName: '张三', department: '统计局业务处' },
      DATA_OFFICE: { username: 'dataoffice', realName: '李四', department: '数据管理办公室' },
      ADMIN: { username: 'admin', realName: '王五', department: '信息化管理处' },
      PUBLIC: { username: 'public', realName: '公众用户', department: '' },
    }
    const user = userMap[key]
    setUser({ role: key, ...user })
  }

  return (
    <div className="role-switch">
      <Dropdown
        menu={{
          items: roleOptions.map((opt) => ({
            key: opt.key,
            label: opt.label,
            onClick: () => handleRoleChange(opt.key as UserRole),
          })),
          selectable: true,
          selectedKeys: [role],
        }}
        placement="topRight"
      >
        <Button icon={<SwapOutlined />}>
          切换角色: {UserRoleMap[role]}
        </Button>
      </Dropdown>
    </div>
  )
}

export default RoleSwitch
