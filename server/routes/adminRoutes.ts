import { Teacher } from "../models/Teacher";
import { Student } from "../models/Student";
import { Router } from "express";
import { registerTeacher, deleteTeacher,getTeacherById,getTeachers,getStudentById,getStudents } from "../controllers/authController";

const router = Router();

// Teacher routes for admin controll
router.get("/teachers", getTeachers);
router.get("/teachers/:id", getTeacherById);
router.post("/register-teacher", registerTeacher);
router.delete("/delete-teacher/:id", deleteTeacher);

// student routes for admin control
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
export default router;
