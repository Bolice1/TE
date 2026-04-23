"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Edit, ClipboardList, Calendar, BookOpen, Percent } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  course: {
    _id: string;
    name: string;
    code: string;
  };
  quizType: "cat" | "exam" | "assignment" | "other";
  totalMarks: number;
  passingMarks: number;
  gradingScale: string;
  date: string;
  term: string;
  status: string;
  createdAt: string;
}

const quizTypeColors = {
  cat: "bg-blue-500/10 text-blue-500",
  exam: "bg-purple-500/10 text-purple-500",
  assignment: "bg-green-500/10 text-green-500",
  other: "bg-gray-500/10 text-gray-500",
};

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.course.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/quizzes/${quiz._id}/marks`}>
            <Button>
              <ClipboardList className="h-4 w-4 mr-2" />
              Record Marks
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge className={quizTypeColors[quiz.quizType]}>
                  {quiz.quizType.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={quiz.status === "active" ? "default" : "secondary"}>
                  {quiz.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Term</p>
                <p className="font-medium">{quiz.term}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(quiz.date), "PPP")}
                </p>
              </div>
            </div>
            {quiz.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{quiz.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grading Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="text-2xl font-bold">{quiz.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passing Marks</p>
                <p className="text-2xl font-bold text-green-600">{quiz.passingMarks}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Grading Scale</p>
                <p className="font-medium capitalize">{quiz.gradingScale.replace(/-/g, " ")}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Pass Percentage</p>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {((quiz.passingMarks / quiz.totalMarks) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{quiz.course.name}</p>
                <p className="text-sm text-muted-foreground">Code: {quiz.course.code}</p>
              </div>
              <Link href={`/dashboard/courses/${quiz.course._id}`}>
                <Button variant="outline">View Course</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
