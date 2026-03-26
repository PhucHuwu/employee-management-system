'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User, AuthResponse, Role } from '@/lib/types'
import apiClient from '@/lib/api/client'
import { getUserAvatarUrlMock } from '@/lib/user-avatar-mock'

type BackendRole = 'ADMIN' | 'MANAGER'

const toUiRole = (role: Role | BackendRole): Role => {
  if (role === 'ADMIN') return 'Admin'
  if (role === 'MANAGER') return 'Manager'
  return role
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (usernameOrEmail: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: Role) => boolean
  hasAnyRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ensureAvatarUrl = (user: User): User => {
  if (user.avatarUrl) return user
  return {
    ...user,
    avatarUrl: getUserAvatarUrlMock({
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? null,
    }),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.resolve().then(() => {
      const storedUser = localStorage.getItem('user')
      const accessToken = localStorage.getItem('accessToken')

      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          parsedUser.role = toUiRole(parsedUser.role as Role | BackendRole)
          setUser(ensureAvatarUrl(parsedUser))
          apiClient.setAccessToken(accessToken)
        } catch {
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
        }
      }

      setIsLoading(false)
    })
  }, [])

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: usernameOrEmail,
      password,
    })

    const normalizedUser: User = {
      ...response.user,
      role: toUiRole(response.user.role as Role | BackendRole),
      fullName: response.user.fullName || response.user.email,
    }
    const userWithAvatar = ensureAvatarUrl(normalizedUser)

    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('user', JSON.stringify(userWithAvatar))
    
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    apiClient.setAccessToken(response.accessToken)
    setUser(userWithAvatar)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    apiClient.setAccessToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((role: Role) => {
    return user?.role === role
  }, [user])

  const hasAnyRole = useCallback((roles: Role[]) => {
    return user ? roles.includes(user.role) : false
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
