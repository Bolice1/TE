import { Request, Response } from 'express'
import Teacher from '../model/Teacher.js'


export const registerTeacher = async (req: Request, res: Response)=>{
    const { name, email, phoneNumber } = req.body;

    try {
        if (!name || !email || !phoneNumber) {

            return res.status(400).json({ msg: "Some data are missing" })
        }
        // does n't exist 
        const exists = await Teacher.findOne({ email: email });

        if (exists) {
            return res.status(400).json({ msg: "Teacher already exists" })
        }
        const newTeacher = await Teacher.create(req.body);
        if (!newTeacher) return res.status(400).json({ msg: "Error occurred" })
        return res.status(201).json({ msg: "Teacher registered successfully" })
    } catch (error) {

        console.log(`Error occurred:\n ${error}`);

    }

}

export const updateTeacher = async (req: Request, res: Response) => {
    try {
        const teacherId = req.params.id;
        // let us check it the teacher does not exist and update

        const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, req.body);
        if (!updatedTeacher) return res.status(400).json({ msg: "Update teacher failed !" })
        return res.status(200).json({ msg: "Teacher updated successfully" })
    } catch (error) {
        console.log(`Error occurred: \n ${error}`)

        process.exit(1)
    }

}


export const deleteTeacher = async (req: Request, res: Response) => {

    try {

        // we aregoing to check if the teacher exists and delete him 
        const teacherId = req.params.id;
        const deletedTeacher = Teacher.findByIdAndDelete(teacherId);
        if (!deletedTeacher) return res.status(400).json({ msg: `No teacher found with this id` })

        return res.status(200).json({ msg: "Teacher deleted successfully" })    

    } catch (error) {
        console.log(`Error occurred: \n${error}`)
        process.exit(1)
    }

}