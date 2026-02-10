"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Building2,
  BarChart3,
  Users,
  Clock,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  let activeSection = null

  const setActiveSection = (section) => {
    activeSection = section
  }

  if (isAuthenticated && user) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Gradient background with decorative elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-50/30 to-white" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white transition-transform group-hover:scale-105 shadow-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-primary bg-clip-text text-transparent hidden sm:inline">
              WorkOps
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="#features"
              onClick={() => setActiveSection("features")}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                activeSection === "features"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-700 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Features
            </Link>
            <Link
              href="#benefits"
              onClick={() => setActiveSection("benefits")}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                activeSection === "benefits"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-700 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Benefits
            </Link>
          </div>

          {/* Mobile Menu Button & Login */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/login")}
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Log in
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="inline-flex w-fit rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
                ✨ Unified Workspace Management
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 text-balance leading-tight">
                Streamline Your Office Operations
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed text-balance">
                WorkOps is the all-in-one platform for managing office utilities, service requests, and facility coordination. Keep your workplace running smoothly with centralized control and real-time insights.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => router.push("/login")}
                className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5 bg-transparent">
                Learn More
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-primary/10">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm text-slate-700 font-medium">
                  Trusted by 500+ companies
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-slate-700 font-medium">
                  Enterprise security
                </span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-white p-10 shadow-2xl">
              <div className="space-y-5">
                {[
                  { title: "Service Requests", desc: "2,543 processed" },
                  { title: "Team Members", desc: "1,240 active" },
                  { title: "Office Facilities", desc: "95% optimal" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-xl border border-primary/10 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-primary/10 bg-gradient-to-b from-white via-purple-50/20 to-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Workplaces
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Everything you need to manage your office efficiently with real-time updates, team collaboration, and comprehensive analytics
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Real-Time Updates",
                description: "Get instant notifications about service requests and facility issues",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Keep your entire team synchronized with shared announcements",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Track metrics and gain insights into office utilization",
              },
              {
                icon: Zap,
                title: "Quick Service Requests",
                description: "Submit and track maintenance requests in seconds",
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                description: "Secure permissions for employees, admins, and super admins",
              },
              {
                icon: Building2,
                title: "Facility Management",
                description: "Centralize all office operations in one platform",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-primary/15 bg-white p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 mb-5 transition-all">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="relative hidden lg:block order-2">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-white via-primary/5 to-white p-12 shadow-2xl">
                <div className="space-y-6">
                  {[
                    { title: "Improved Efficiency", desc: "Streamline operations and reduce overhead" },
                    { title: "Better Communication", desc: "Keep teams synchronized in real-time" },
                    { title: "Cost Savings", desc: "Reduce waste and optimize resource usage" },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">
                          {benefit.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 order-1">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  Why Choose WorkOps?
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Transform how your organization manages office operations with our intuitive and comprehensive platform designed for modern workplaces.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Centralized control of all office utilities and services",
                  "Real-time tracking and notifications for immediate action",
                  "Comprehensive analytics and detailed reporting",
                  "User-friendly interface for all skill levels",
                  "24/7 priority support for enterprise clients",
                  "Secure role-based access control system",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span className="text-slate-700 font-medium">{point}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                onClick={() => router.push("/login")} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all gap-2"
              >
                Start Using WorkOps
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Office?
          </h2>
          <p className="text-lg text-slate-600 mb-10">
            Join hundreds of companies that trust WorkOps for their facility management needs.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/login")}
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-gradient-to-b from-white to-slate-50 py-12 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                © 2026 WorkOps. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="#"
                className="text-sm text-slate-600 hover:text-primary font-medium transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-600 hover:text-primary font-medium transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-slate-600 hover:text-primary font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
