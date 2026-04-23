import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Shield,
} from "lucide-react";

export default function HomePage() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--deep-space-blue)] via-[var(--baltic-blue)] to-[var(--cerulean)]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TE Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-[var(--deep-space-blue)] hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            Teaching and Evaluation Made Simple
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto text-pretty">
            A comprehensive platform for teachers offering extracurricular
            courses. Manage students, create courses, record marks, and generate
            professional report cards with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[var(--deep-space-blue)] hover:bg-white/90 w-full sm:w-auto"
              >
                Start Teaching Today
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: Users,
              title: "Student Management",
              description:
                "Register and manage students with detailed profiles including parent contacts and guardian information.",
            },
            {
              icon: BookOpen,
              title: "Course Management",
              description:
                "Create and organize courses by academic year, term, and level. Easily enroll students in multiple courses.",
            },
            {
              icon: FileText,
              title: "Quiz & Assessment",
              description:
                "Create CATs, exams, assignments, and custom assessments. Record and track student marks effortlessly.",
            },
            {
              icon: BarChart3,
              title: "Auto Grading",
              description:
                "Automatic grade calculation based on the standard grading scale. From A (Excellent) to F (Fail).",
            },
            {
              icon: FileText,
              title: "Report Cards",
              description:
                "Generate professional PDF report cards for individual students or in bulk with one click.",
            },
            {
              icon: Shield,
              title: "Secure Platform",
              description:
                "Enterprise-grade security with encrypted data, secure authentication, and role-based access control.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/70 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} TE Platform. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
