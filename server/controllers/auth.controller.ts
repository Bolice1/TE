import Coach from '../models/coach.model.js'
import bcrypt from 'bcrypt'
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import envConfiguration from '../config/env.js';




export const registerCoach = async (req: Request, res: Response) => {
    try {
        const { name, email, coachingName, address, password } = req.body;
        if (!name) return res.status(400).json({ msg: "Name not provided" })
        if (!email) return res.status(400).json({ msg: "Email not provided" })
        if (!coachingName) return res.status(400).json({ msg: "Coaching name is required" })
        if (!address) return res.status(400).json({ msg: "Address is required" })
        if (!password) return res.status(400).json({ msg: "Password required" })

        const existingUser = await Coach.findOne({ email: email });
        if (existingUser) return res.status(400).json({ msg: "User already exists" })
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCoach = await Coach.create({
            email,
            name,
            address,
            coachingName,
            password: hashedPassword,
        })

        return res.status(201).json({
            msg: "Coach created successfully",

        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "something went wrong" })
    }


}

export const login = async (req: Request, res: Response) => {
    try {
        const { password, email } = req.body;

        if (!password)
            return res.status(400).json({ msg: "Password required" });

        if (!email)
            return res.status(400).json({ msg: "Email required" });

        const UserExists = await Coach.findOne({ email });

        if (!UserExists)
            return res.status(401).json({ msg: "Invalid credentials" });

        const validPassword = await bcrypt.compare(
            password,
            UserExists.password
        );

        if (!validPassword)
            return res.status(401).json({ msg: "Unauthorized" });

        const token = jwt.sign(
            { userId: UserExists.id },
            envConfiguration.jwt_token as string,
            {
                expiresIn:
                    envConfiguration.tokenExpiresIn as jwt.SignOptions["expiresIn"]
            }
        );

        return res.status(200).json({
            msg: "Login successful",
            token
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: "Something went wrong"
        });
    }
};

export const update = async (req: Request, res: Response) => {
    const { name, email, coachingName, address } = req.body;
    if (!email) return res.status(401).json({ msg: "Email is required for update" })

    if (!name && !coachingName && !address) {
        return res.status(400).json({ msg: "Nothing provided for update" });
    }

    try {
        const updatedProfile = await Coach.findOneAndUpdate(
            { email },
            { $set: { name, coachingName, address } },
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ msg: "Coach not found" });
        }

        return res.status(200).json(updatedProfile);
    } catch (error) {
        return res.status(500).json({ msg: "something went wrong" });
    }
};

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const deleteUser = await Coach.findOneAndUpdate(
            { email },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            },
            { new: true }
        );

        if (!deleteUser) {
            return res.status(404).json({
                msg: "Coach not found"
            });
        }

        return res.status(200).json({
            msg: "Profile deleted successfully",
            deleteUser
        });

    } catch (error) {
        return res.status(500).json({
            msg: "Server error",
            error
        });
    }
};