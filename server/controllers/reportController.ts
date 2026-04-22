import Report from '../model/Report.js'
import {Request, Response} from 'express'

export const createReport = async(req: Request, res: Response) =>{

    const {email, studentId, marks} = req.body

    try {
        
        const newReport = new Report({
            email,
            studentId,
            marks
        })

        await newReport.save()

        res.status(201).json({msg: "Report created successfully", report: newReport})

    } catch (error) {
        res.status(500).json({msg: "Server error", error})
    }

}

export const getAllReports = async(req: Request, res: Response) =>{

    try {
        
        const reports = await Report.find().populate('studentId', 'name')

        res.status(200).json({msg: "Reports fetched successfully", reports})

    } catch (error) {
        res.status(500).json({msg: "Server error", error})
    }

}

export const getReportById = async(req: Request, res: Response) =>{

    const {id} = req.params

    try {
        
        const report = await Report.findById(id).populate('studentId', 'name')

        if(!report){
            return res.status(404).json({msg: "Report not found"})
        }

        res.status(200).json({msg: "Report fetched successfully", report})

    } catch (error) {
        res.status(500).json({msg: "Server error", error})
    }

}   