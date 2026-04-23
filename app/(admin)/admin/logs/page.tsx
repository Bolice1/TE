"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface LogEntry {
  _id: string;
  user: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ACTIONS = [
  "login",
  "register",
  "create_student",
  "update_student",
  "delete_student",
  "create_course",
  "update_course",
  "delete_course",
  "create_quiz",
  "update_quiz",
  "delete_quiz",
  "record_marks",
  "update_marks",
  "generate_report_cards",
  "delete_report_card",
  "delete_teacher",
  "activate_teacher",
  "deactivate_teacher",
];

export default function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(actionFilter && actionFilter !== "all" && { action: actionFilter }),
    ...(roleFilter && roleFilter !== "all" && { userRole: roleFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const { data, isLoading } = useSWR<LogsResponse>(
    `/api/admin/logs?${queryParams}`,
    fetcher
  );

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "bg-red-500";
    if (action.includes("create") || action.includes("register")) return "bg-green-500";
    if (action.includes("update") || action.includes("record")) return "bg-blue-500";
    if (action.includes("login")) return "bg-purple-500";
    if (action.includes("generate")) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const clearFilters = () => {
    setActionFilter("");
    setRoleFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Activity Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor all system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {ACTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {formatAction(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Logs
          </CardTitle>
          <CardDescription>
            {data?.pagination.total || 0} log entries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data?.logs && data.logs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                      <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            {format(new Date(log.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.createdAt), "h:mm:ss a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.userName}</p>
                            <Badge
                              variant={log.userRole === "admin" ? "default" : "secondary"}
                              className="mt-1 text-xs"
                            >
                              {log.userRole}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden max-w-xs truncate md:table-cell">
                          <span title={log.details}>{log.details}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="text-xs">{log.ipAddress}</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.pages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                      disabled={page === data.pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No logs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Activity logs will appear here as users interact with the system.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
