import { Router } from "express";
import { getTeachers,getTeacherById } from "../controllers/authController";
import { getMarksByStudent, createMarks,getTotalmarksforateacher,getAverageMarksForSubject } from "../controllers/marksController";

const router = Router();

// here we will have routes for teachers to manage their students, view their marks, etc. but they will not have access to all students and teachers in the system, only those in their class
router.get('/marks/student/:studentId', getMarksByStudent);
router.post('/marks', createMarks);
router.get('/marks/teacher/:teacherId/total', getTotalmarksforateacher);
router.get('/marks/subject/:subjectId/average', getAverageMarksForSubject);

export default router;  