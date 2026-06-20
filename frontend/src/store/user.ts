import { create } from 'zustand'
import type { UserRole } from '@/types'

interface UserState {
  username: string
  realName: string
  role: UserRole
  department: string
  setUser: (user: Partial<UserState>) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  username: 'admin',
  realName: '系统管理员',
  role: 'ADMIN',
  department: '信息化管理处',
  setUser: (user) => set(user),
  logout: () => set({
    username: '',
    realName: '',
    role: 'PUBLIC',
    department: '',
  }),
}))
