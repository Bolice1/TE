import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Student, Course, Quiz, Mark } from "@/lib/db/models";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  FileQuestion,
  ClipboardList,
  Plus,
  ArrowRight,
} from "lucide-react";

async function getTeacherStats(teacherId: string) {
  await connectToDatabase();

  const [studentsCount, coursesCount, quizzesCount, marksCount] =
    await Promise.all([
      Student.countDocuments({ teacherId, isActive: true }),
      Course.countDocuments({ teacherId, isActive: true }),
      Quiz.countDocuments({ teacherId }),
      Mark.countDocuments({ teacherId }),
    ]);

  const recentStudents = await Student.find({ teacherId, isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentQuizzes = await Quiz.find({ teacherId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("courseId", "name")
    .lean();

  return {
    studentsCount,
    coursesCount,
    quizzesCount,
    marksCount,
    recentStudents,
    recentQuizzes,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const stats = await getTeacherStats(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your teaching activities
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/students/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </Link>
          <Link href="/dashboard/courses/new">
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={stats.studentsCount}
          description="Active students"
          icon={Users}
        />
        <StatsCard
          title="Courses"
          value={stats.coursesCount}
          description="Active courses"
          icon={BookOpen}
        />
        <StatsCard
          title="Quizzes"
          value={stats.quizzesCount}
          description="Total assessments"
          icon={FileQuestion}
        />
        <StatsCard
          title="Marks Recorded"
          value={stats.marksCount}
          description="Total entries"
          icon={ClipboardList}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Recent Students
            </CardTitle>
            <Link href="/dashboard/students">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No students yet</p>
                <Link href="/dashboard/students/new">
                  <Button variant="link" size="sm">
                    Add your first student
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentStudents.map((student) => (
                  <Link
                    key={student._id.toString()}
                    href={`/dashboard/students/${student._id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.isOrphan ? "Guardian care" : "With parents"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quizzes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Recent Quizzes
            </CardTitle>
            <Link href="/dashboard/quizzes">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentQuizzes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileQuestion className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No quizzes yet</p>
                <Link href="/dashboard/quizzes/new">
                  <Button variant="link" size="sm">
                    Create your first quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentQuizzes.map((quiz) => (
                  <Link
                    key={quiz._id.toString()}
                    href={`/dashboard/quizzes/${quiz._id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                      <FileQuestion className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.type} - {quiz.totalMarks} marks
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {(quiz.courseId as { name: string })?.name || "N/A"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
