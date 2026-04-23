"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Edit, Mail, Phone, MapPin, User, Users, GraduationCap } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  level: string;
  academicYear: string;
  isOrphan: boolean;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  guardians: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isEmergencyContact: boolean;
  }>;
  enrollmentDate: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function StudentViewPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setStudent(data);
        }
      } catch (error) {
        console.error("Failed to fetch student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
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
            <h1 className="text-2xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted-foreground">Student Profile</p>
          </div>
        </div>
        <Link href={`/dashboard/students/${student._id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{student.firstName} {student.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{student.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {format(new Date(student.dateOfBirth), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={student.status === "active" ? "default" : "secondary"}>
                  {student.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orphan Status</p>
                <Badge variant={student.isOrphan ? "destructive" : "outline"}>
                  {student.isOrphan ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrollment Date</p>
                <p className="font-medium">
                  {format(new Date(student.enrollmentDate), "PPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Level/Grade</p>
                <p className="font-medium">{student.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-medium">{student.academicYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.address && (student.address.street || student.address.city) ? (
              <div className="space-y-1">
                {student.address.street && <p>{student.address.street}</p>}
                <p>
                  {[student.address.city, student.address.state, student.address.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Guardians/Parents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guardians / Parents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.guardians && student.guardians.length > 0 ? (
              <div className="space-y-4">
                {student.guardians.map((guardian, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-muted/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{guardian.name}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{guardian.relationship}</Badge>
                        {guardian.isEmergencyContact && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{guardian.phone}</span>
                      </div>
                      {guardian.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{guardian.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {student.isOrphan
                  ? "Student is registered as an orphan"
                  : "No guardians added"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {student.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{student.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
