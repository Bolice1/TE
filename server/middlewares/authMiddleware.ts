import {Request, Response, NextFunction} from 'express'
import Teacher from '../model/Teacher.js'

export const isAregisteredTeacher = async(req: Request, res: Response, next: NextFunction)=>{


    const isTeacher = await Teacher.findOne({email: req.body.email})

    if(!isTeacher) return res.status(400).json({msg: "You are not a registered teacher"})

    next()



}
