import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/courses/course-form";
import { ArrowLeft } from "lucide-react";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Course</h2>
          <p className="text-muted-foreground">
            Add a new course to your teaching portfolio
          </p>
        </div>
      </div>

      <CourseForm />
    </div>
  );
}
