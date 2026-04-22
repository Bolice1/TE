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
