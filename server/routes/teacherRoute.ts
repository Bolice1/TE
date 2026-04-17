import { Router } from "express";
import { getStudents,getStudentById,createStudent,updateStudent,deleteStudent } from "../controllers/authController";

const router = Router();

// Teacher routes for his/her operations { adding students to his class, viewing students in his/her class, etc. FYI he is not able to see all teachers and students in the system, only those in his/her class }
router.get("/")
export default router;