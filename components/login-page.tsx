"use client";

import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { users } from "@/lib/data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabel: Record<string, string> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "Super Admin",
};

const roleBadgeClass: Record<string, string> = {
  employee: "bg-primary/10 text-primary",
  admin: "bg-primary/15 text-primary",
  superadmin: "bg-primary/20 text-primary",
};

export function LoginPage() {
  const { login } = useAuth();

  const handleLogin = (userId: string) => {
    login(userId);
  };

  const demoUser = users[0];
  const otherUsers = users.slice(1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-purple-50/20 to-white px-4 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors mb-8"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>
        </div>

        {/* Main Login Card */}
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-b from-white to-primary/5 rounded-t-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
              <Building2 className="h-7 w-7" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-primary bg-clip-text text-transparent">
              WorkOps
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Sign in to the Office Utility Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col gap-6">
              {/* Google Sign In Button - Centered at Top */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => console.log("Google sign in")}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white py-3 px-4 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="font-semibold text-slate-900">
                    Continue with Google
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-600 font-medium">
                    or use demo account
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Accounts Selection Section at Bottom */}
          <div className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 rounded-b-lg px-6 py-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-slate-900 text-center">
                Select an account to continue
              </p>

              {/* All Users */}
              <div className="space-y-3">
                {users.map((u, idx) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleLogin(u.id)}
                    className={`flex w-full items-center gap-4 rounded-lg border-2 transition-all p-4 text-left hover:shadow-md ${
                      idx === 0
                        ? "border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10"
                        : "border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <Avatar
                      className={`h-10 w-10 flex-shrink-0 border-2 ${
                        idx === 0
                          ? "border-primary/50 bg-primary/10"
                          : "border-slate-300"
                      }`}
                    >
                      <AvatarFallback
                        className={`text-xs font-bold ${
                          idx === 0
                            ? "bg-primary/25 text-primary"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        {u.name}
                        {idx === 0 && (
                          <span className="text-primary ml-2 text-xs font-bold">
                            Demo
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-600">{u.email}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold flex-shrink-0 ${roleBadgeClass[u.role]}`}
                    >
                      {roleLabel[u.role]}
                    </Badge>
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-slate-600 mt-2">
                Select any account to sign in. Roles are managed by the Super
                Admin.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account?{" "}
            <Link
              href="/"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
