"use client"

import { useAuth } from "@/lib/auth-context"
import { EmployeeDashboard } from "@/components/dashboard-employee"
import { AdminDashboard } from "@/components/dashboard-admin"
import { SuperadminDashboard } from "@/components/dashboard-superadmin"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case "superadmin":
      return <SuperadminDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      return <EmployeeDashboard />
  }
}
