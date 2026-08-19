import type { Request, Response } from "express";
import { UserService } from "./user.services";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await UserService.createUserIntoDB(req.body);
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json({ success: true, message: 'Users fetched successfully', users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export { createUser, getAllUsers };