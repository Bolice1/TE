import { Marks } from "../models/Marks";
import { Student } from "../models/Student";
import { Request, Response } from "express";

// Create a new marks entry
export const createMarks = async (req: Request, res: Response) => {
    try {
        const { student, teacher, subject, marksObtained, totalMarks, grade } = req.body;

        // Validate student existence
        const studentExists = await Student.findById(student);
        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const newMarks = new Marks({
            student,
            teacher,
            subject,
            marksObtained,
            totalMarks,
            grade
        });

        await newMarks.save();

        return res.status(201).json({
            success: true,
            data: newMarks
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Failed to create marks entry",
            error: error.message
        });
    }
};

// Get marks for a specific student
export const getMarksByStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;

        // Validate student existence
        const studentExists = await Student.findById(studentId);
        if (!studentExists) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const marks = await Marks.find({ student: studentId }).populate("teacher subject");

        return res.status(200).json({
            success: true,
            count: marks.length,
            data: marks
        });
    }   catch (error: any) {
        return res.status(500).json({
            message: "Failed to fetch marks",
            error: error.message
        });
    }
};

export const getTotalmarksforateacher = async (req: Request, res: Response) => {
    try {
        const { teacherId } = req.params;

        const marks = await Marks.find({ teacher: teacherId });

        const totalMarks = marks.reduce((total, mark) => total + mark.marksObtained, 0);

        return res.status(200).json({
            success: true,
            data: { totalMarks }
        });
    } catch (error: any) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid teacher ID format"        
            });
        }
        return res.status(500).json({
            message: "Failed to calculate total marks",
            error: error.message
        });
    }
};

export const getAverageMarksForSubject = async (req: Request, res: Response) => {
    try {
        const { subjectId } = req.params;

        const marks = await Marks.find({ subject: subjectId });

        if (marks.length === 0) {
            return res.status(404).json({
                message: "No marks found for this subject"
            });
        }

        const averageMarks = marks.reduce((total, mark) => total + mark.marksObtained, 0) / marks.length;

        return res.status(200).json({
            success: true,
            data: { averageMarks }
        });
    } catch (error: any) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid subject ID format"        
            });
        }
        return res.status(500).json({
            message: "Failed to calculate average marks",
            error: error.message
        });
    }
};