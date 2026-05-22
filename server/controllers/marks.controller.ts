import Marks from "../models/marks.model.js";
import type { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
    try {
        const { student, course, marks, assignment } = req.body;

        const choach = req.user.id;

        if (!student)
            return res.status(400).json({ msg: "Select student" });

        if (!course)
            return res.status(400).json({ msg: "Select course" });

        if (marks === undefined)
            return res.status(400).json({ msg: "No marks entered" });

        if (!assignment)
            return res.status(400).json({ msg: "Select assignment" });

        const registered = await Marks.create({
            student,
            course,
            choach,
            marks,
            assignment
        });

        return res.status(201).json(registered);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: "Something went wrong"
        });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { marksId, marks } = req.body;

        const choachId = req.user.id;

        if (!marksId) {
            return res.status(400).json({
                msg: "No marks selected for update"
            });
        }

        if (marks === undefined) {
            return res.status(400).json({
                msg: "No marks entered"
            });
        }

        const marksExists = await Marks.findById(marksId);

        if (!marksExists) {
            return res.status(404).json({
                msg: "Marks do not exist"
            });
        }

        if (marksExists.choach.toString() !== choachId) {
            return res.status(403).json({
                msg: "Unauthorized to update these marks"
            });
        }

        const updatedMarks = await Marks.findByIdAndUpdate(
            marksId,
            {
                $set: {
                    marks
                }
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            msg: "Marks updated successfully",
            updatedMarks
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: "Something went wrong"
        });
    }
};