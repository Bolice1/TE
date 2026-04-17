import { Router } from "express";
import { getStudentById, getStudents } from "../controllers/authController";

const router = Router();

// Student routes
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);

export default router;