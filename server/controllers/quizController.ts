import Quiz from '../model/Quiz.js'
import { Request, Response } from 'express'


export const createQuiz = async (req: Request, res: Response) => {
    try {
        const newQuiz = await Quiz.create(req.body);
        if (!newQuiz) return res.status(500).json({ msg: "quiz not created" })
        return res.status(201).json({ msg: "quiz created successfully" })

    } catch (error) {
        console.log("Error occured while creating a new quiz")
    }
}


export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const quizId = req.params.id;

        const updatedQuiz = Quiz.findByIdAndUpdate(quizId, req.body);
        if (!updatedQuiz) return res.status(500).json({ msg: "quiz not updated" })

    } catch (error) {

        console.log("Error occurred")
        process.exit(1)

    }
}

export const deleteQuiz = async (req: Request, res: Response) => {
    try {


        const deletedQuiz = Quiz.findByIdAndDelete(req.params.id, req.body);

        if (!deletedQuiz) return res.status(400).json({ msg: "Quiz not found" });
        return res.status(200).json({ msg: "quiz deleted successfully" })

    } catch (error) {
        console.log("Errror occurred")
        process.exit(1)
    }
}
