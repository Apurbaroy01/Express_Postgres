import type { Request, Response } from "express";
import { pool } from "../../db";

const createUser = async (req: Request, res: Response) => {
    const { name, email, password, age } = req.body;

    try {
        const result = await pool.query(`
        INSERT INTO users (name, email, password, age)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [name, email, password, age]
        );

        res.status(200).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

export { createUser };