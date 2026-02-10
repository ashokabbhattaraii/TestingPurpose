"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { User } from "./types"
import { users } from "./data"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userId: string) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback((userId: string) => {
    const foundUser = users.find((u) => u.id === userId)
    if (foundUser) {
      setUser({ ...foundUser })
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  // Re-read the current user from the users array (picks up role changes made by super admin)
  const refreshUser = useCallback(() => {
    if (user) {
      const updated = users.find((u) => u.id === user.id)
      if (updated) {
        setUser({ ...updated })
      }
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
