import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { ArrowLeft } from "lucide-react";

export default function NewQuizPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quizzes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Quiz</h2>
          <p className="text-muted-foreground">
            Create a new assessment for your course
          </p>
        </div>
      </div>

      <QuizForm />
    </div>
  );
}
