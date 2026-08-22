import type { Request, Response } from "express"
import { authServices } from "./auth.services";

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authServices.loginUserIntoDB(req.body);
        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ message: 'User logged in successfully', data: result });
    } catch (error: any) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
}

export const authController = {
    loginUser
}