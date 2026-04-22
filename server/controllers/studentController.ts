import Student from "../model/Student.js";
import { Request, Response } from "express";
import Report from "../model/Report.js";

export const createStudent = async (req: Request, res: Response) => {
    try {
        const newStudent = await Student.create(req.body);
        if (!newStudent) return res.status(500).json({ msg: "student not created" })
        return res.status(201).json({ msg: "student created successfully" })

    } catch (error) {
        console.log("Error occured while creating a new student")
    }
}

export const getStudentReportCard = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.id;
        if(!studentId) return res.status(400).json({ msg: "student id is required" })
        const reportCard = await Report.findOne({ student: studentId }).populate("student");
        if (!reportCard) return res.status(404).json({ msg: "report card not found" })
        return res.status(200).json(reportCard)

    } catch (error) {
        console.log("Error occurred while fetching report card")
    }
}

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.id;
        const updatedStudent = await Student.findByIdAndUpdate(studentId, req.body);
        if (!updatedStudent) return res.status(500).json({ msg: "student not updated" })
        return res.status(200).json({ msg: "student updated successfully" })

    } catch (error) {
        console.log("Error occurred while updating student")
    }
}

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.id;
        const deletedStudent = await Student.findByIdAndDelete(studentId);
        if (!deletedStudent) return res.status(400).json({ msg: "student not found" });
        return res.status(200).json({ msg: "student deleted successfully" })

    } catch (error) {
        console.log("Errror occurred while deleting student")
    }   

}
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find();
        return res.status(200).json(students)
    } catch (error) {
        console.log("Error occurred while fetching students")
    }
}

export const getStudentById = async (req: Request, res: Response) => {  
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ msg: "student not found" })
        return res.status(200).json(student)
    } catch (error) {
        console.log("Error occurred while fetching student by id")
    }
}
export default {
    createStudent,
    getStudentReportCard,
    updateStudent,
    deleteStudent,
    getAllStudents,
    getStudentById
}   