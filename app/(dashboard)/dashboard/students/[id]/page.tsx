import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/auth-options";
import { connectToDatabase } from "@/lib/db/connect";
import { Student } from "@/lib/db/models";
import { Button } from "@/components/ui/button";
import { StudentForm } from "@/components/students/student-form";
import { ArrowLeft } from "lucide-react";

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  await connectToDatabase();

  const student = await Student.findOne({
    _id: id,
    teacherId: session.user.id,
  }).lean();

  if (!student) {
    notFound();
  }

  const formData = {
    firstName: student.firstName,
    lastName: student.lastName,
    dateOfBirth: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: student.gender || "",
    address: {
      street: student.address?.street || "",
      city: student.address?.city || "",
      state: student.address?.state || "",
      postalCode: student.address?.postalCode || "",
      country: student.address?.country || "",
    },
    isOrphan: student.isOrphan,
    guardianInfo: {
      name: student.guardianInfo?.name || "",
      relationship: student.guardianInfo?.relationship || "",
      phone: student.guardianInfo?.phone || "",
      email: student.guardianInfo?.email || "",
    },
    parents: student.parents.map((p) => ({
      name: p.name,
      relationship: p.relationship as "father" | "mother" | "guardian",
      phone: p.phone,
      email: p.email || "",
      isEmergencyContact: p.isEmergencyContact,
    })),
    notes: student.notes || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Student</h2>
          <p className="text-muted-foreground">
            Update information for {student.firstName} {student.lastName}
          </p>
        </div>
      </div>

      <StudentForm initialData={formData} studentId={id} />
    </div>
  );
}
