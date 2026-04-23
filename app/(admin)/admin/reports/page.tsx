"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface ReportCard {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    level: string;
  };
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  academicYear: string;
  term: string;
  generatedAt: string;
  pdfUrl: string;
  overallGrade: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerm, setFilterTerm] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/reports");
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      `${report.student.firstName} ${report.student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${report.teacher.firstName} ${report.teacher.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesTerm = filterTerm === "all" || report.term === filterTerm;
    return matchesSearch && matchesTerm;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Cards</h1>
        <p className="text-muted-foreground">
          View all generated report cards across the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Reports
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select value={filterTerm} onValueChange={setFilterTerm}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No report cards found</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell className="font-medium">
                        {report.student.firstName} {report.student.lastName}
                      </TableCell>
                      <TableCell>
                        {report.teacher.firstName} {report.teacher.lastName}
                      </TableCell>
                      <TableCell>{report.student.level}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.term}</Badge>
                      </TableCell>
                      <TableCell>{report.academicYear}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.overallGrade === "A" ||
                            report.overallGrade === "B"
                              ? "default"
                              : report.overallGrade === "F"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {report.overallGrade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.generatedAt), "PP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(report.pdfUrl, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = report.pdfUrl;
                              a.download = `report-${report.student.firstName}-${report.student.lastName}.pdf`;
                              a.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
