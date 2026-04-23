"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  Trash2,
  Plus,
  Search,
  Loader2,
  Users,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ACADEMIC_YEARS = [
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "2026-2027",
];

const TERMS = ["Term 1", "Term 2", "Term 3"];

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  level: string;
}

interface ReportCard {
  _id: string;
  student: Student;
  academicYear: string;
  term: string;
  percentage: number;
  grade: string;
  gpa: number;
  pdfUrl: string;
  generatedAt: string;
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterTerm, setFilterTerm] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [generateAll, setGenerateAll] = useState(false);
  const [newReportYear, setNewReportYear] = useState("");
  const [newReportTerm, setNewReportTerm] = useState("");

  const { data: reportCards, mutate: mutateReports, isLoading } = useSWR<ReportCard[]>(
    "/api/report-cards",
    fetcher
  );

  const { data: students } = useSWR<Student[]>("/api/students", fetcher);

  const filteredReports = reportCards?.filter((report) => {
    const matchesSearch =
      report.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || report.academicYear === filterYear;
    const matchesTerm = !filterTerm || report.term === filterTerm;
    return matchesSearch && matchesYear && matchesTerm;
  });

  const handleGenerateReports = async () => {
    if (!newReportYear || !newReportTerm) {
      alert("Please select academic year and term");
      return;
    }

    if (!generateAll && selectedStudents.length === 0) {
      alert("Please select at least one student or choose to generate for all");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: generateAll ? [] : selectedStudents,
          academicYear: newReportYear,
          term: newReportTerm,
          generateAll,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate reports");
      }

      const data = await response.json();
      alert(data.message);
      mutateReports();
      setIsDialogOpen(false);
      setSelectedStudents([]);
      setGenerateAll(false);
    } catch (error) {
      console.error("Error generating reports:", error);
      alert(error instanceof Error ? error.message : "Failed to generate reports");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report card?")) return;

    try {
      const response = await fetch(`/api/report-cards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete report card");

      mutateReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report card");
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500";
      case "B":
        return "bg-blue-500";
      case "C":
        return "bg-cyan-500";
      case "D":
        return "bg-yellow-500";
      case "E":
        return "bg-orange-500";
      case "S":
        return "bg-red-400";
      case "F":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Report Cards</h1>
          <p className="text-sm text-muted-foreground">
            Generate and manage student report cards
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Reports</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Report Cards</DialogTitle>
              <DialogDescription>
                Select students and period to generate report cards
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select value={newReportYear} onValueChange={setNewReportYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select value={newReportTerm} onValueChange={setNewReportTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateAll"
                  checked={generateAll}
                  onCheckedChange={(checked) => {
                    setGenerateAll(checked as boolean);
                    if (checked) setSelectedStudents([]);
                  }}
                />
                <Label htmlFor="generateAll" className="cursor-pointer">
                  Generate for all active students
                </Label>
              </div>

              {!generateAll && (
                <div className="space-y-2">
                  <Label>Select Students</Label>
                  <div className="max-h-48 overflow-y-auto rounded-md border p-2">
                    {students?.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={student._id}
                          checked={selectedStudents.includes(student._id)}
                          onCheckedChange={() => toggleStudentSelection(student._id)}
                        />
                        <Label htmlFor={student._id} className="cursor-pointer text-sm">
                          {student.firstName} {student.lastName} ({student.studentId})
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedStudents.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedStudents.length} student(s) selected
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleGenerateReports}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report Cards
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTerm} onValueChange={setFilterTerm}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERMS.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            {filteredReports?.length || 0} report card(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReports && filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Level</TableHead>
                    <TableHead>Year/Term</TableHead>
                    <TableHead className="hidden md:table-cell">Grade</TableHead>
                    <TableHead className="hidden lg:table-cell">GPA</TableHead>
                    <TableHead className="hidden md:table-cell">Generated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {report.student.firstName} {report.student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.student.studentId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {report.student.level}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs">{report.academicYear}</span>
                          <Badge variant="outline" className="w-fit text-xs">
                            {report.term}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={getGradeBadgeColor(report.grade)}>
                          {report.grade} ({report.percentage.toFixed(1)}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {report.gpa.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(report.generatedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a
                              href={report.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReport(report._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No report cards found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate report cards for your students to see them here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reportCards?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{students?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Term</p>
                <p className="text-2xl font-bold">
                  {reportCards?.filter((r) => r.term === "Term 1").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-500/10 p-3">
                <Download className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Grade</p>
                <p className="text-2xl font-bold">
                  {reportCards && reportCards.length > 0
                    ? (
                        reportCards.reduce((sum, r) => sum + r.percentage, 0) /
                        reportCards.length
                      ).toFixed(1) + "%"
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
