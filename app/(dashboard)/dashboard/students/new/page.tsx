import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StudentForm } from "@/components/students/student-form";
import { ArrowLeft } from "lucide-react";

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Student</h2>
          <p className="text-muted-foreground">
            Register a new student in the system
          </p>
        </div>
      </div>

      <StudentForm />
    </div>
  );
}
