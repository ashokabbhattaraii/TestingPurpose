"use client"

import React from "react"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Lock, Bell, Shield, Copy, Check } from "lucide-react"
import { toast } from "sonner"

const roleLabel: Record<string, string> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "Super Admin",
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: user?.notificationPreferences?.emailNotifications ?? true,
    announcements: user?.notificationPreferences?.announcements ?? true,
    assignments: user?.notificationPreferences?.assignments ?? true,
  })

  useEffect(() => {
    if (user?.notificationPreferences) {
      setNotificationPrefs(user.notificationPreferences)
    }
  }, [user])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSavePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.success("Password updated successfully")
    }, 1000)
  }

  const handleSaveNotifications = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Notification preferences saved")
    }, 1000)
  }

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security, preferences, and privacy settings.
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>
            View your account details and basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Full Name</Label>
              <Input
                type="text"
                value={user.name}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="px-2 bg-transparent"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Department</Label>
              <Input
                type="text"
                value={user.department}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Role</Label>
              <Input
                type="text"
                value={roleLabel[user.role]}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Account Status</Label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <span className="text-sm capitalize font-medium text-foreground">
                  {user.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Last Login</Label>
              <span className="text-sm text-foreground">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Password & Security</CardTitle>
              <CardDescription>
                Update your password and manage security settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">Security Tip</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use a strong password with at least 8 characters</li>
              <li>• Combine uppercase, lowercase, numbers, and symbols</li>
              <li>• Never share your password with anyone</li>
              <li>• Change your password regularly for better security</li>
            </ul>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={handlePasswordChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handlePasswordChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <Button
              onClick={handleSavePassword}
              disabled={
                isSaving ||
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword
              }
              className="w-full sm:w-auto"
            >
              {isSaving ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <Switch
                checked={notificationPrefs.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    emailNotifications: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Announcements
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about new office announcements
                </p>
              </div>
              <Switch
                checked={notificationPrefs.announcements}
                onCheckedChange={(checked) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    announcements: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground cursor-pointer">
                  Task Assignments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when you're assigned to tasks
                </p>
              </div>
              <Switch
                checked={notificationPrefs.assignments}
                onCheckedChange={(checked) =>
                  setNotificationPrefs((prev) => ({
                    ...prev,
                    assignments: checked,
                  }))
                }
              />
            </div>
          </div>

          <Button
            onClick={handleSaveNotifications}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and visibility settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-900 mb-2">Privacy Notice</p>
            <p className="text-xs text-amber-800">
              Your profile information is visible to other team members within the organization. 
              Contact your administrator to request additional privacy restrictions.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">
                  Show Profile to Team
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow team members to view your profile
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-foreground">
                  Show Last Login Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display when you last accessed the system
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Button variant="outline" className="w-full sm:w-auto bg-transparent">
            Save Privacy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
