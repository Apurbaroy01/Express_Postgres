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

// get single user
const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await UserService.getUserById(id as string);
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User fetched successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

// update user
const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password, age } = req.body;
    try {
        const result = await UserService.updateUser(id as string, { name, email, password, age });
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// DELETE USER
const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await UserService.deleteUser(id as string);
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

export const userController = {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
};