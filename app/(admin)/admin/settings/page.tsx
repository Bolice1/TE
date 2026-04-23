"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Shield,
  Mail,
  User,
  Calendar,
  Settings,
  Palette,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your admin account and preferences
        </p>
      </div>

      {/* Admin Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Profile
          </CardTitle>
          <CardDescription>Your administrator account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-xl font-bold">{session?.user?.name || "Admin"}</p>
              <Badge className="mt-1">System Administrator</Badge>
            </div>
          </div>

          <div className="grid gap-4 pt-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{session?.user?.role || "admin"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how TE Admin looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>TE Platform details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium">TE - Teaching & Evaluation</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Environment</p>
              <p className="font-medium">Production</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/teachers"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Teachers</p>
                <p className="text-sm text-muted-foreground">View and manage teacher accounts</p>
              </div>
            </a>
            <a
              href="/admin/logs"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Activity Logs</p>
                <p className="text-sm text-muted-foreground">View system activity history</p>
              </div>
            </a>
            <a
              href="/admin"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Dashboard</p>
                <p className="text-sm text-muted-foreground">System overview and stats</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
