import type { Request, Response } from "express";
import { pool } from "../../db";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users
            `);
        res.status(200).json({ success: true, message: 'Users fetched successfully', users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export { getAllUsers };