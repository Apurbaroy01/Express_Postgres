import type { Request, Response } from "express";
import { profileService } from "./profile.services";

const createProfile = async (req: Request, res: Response) => {
    try {
        const result = await profileService.createProfileIntoDB(req.body);
        
        res.status(200).json({
            success: true,
            message: "Profile created successfully",
            data: result.rows[0]
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error
        });
    }

};

export const profileController = {
    createProfile
}