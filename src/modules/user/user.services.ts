import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (paload: IUser) => {
    const { name, email, password, age } = paload;
    const result = await pool.query(`
        INSERT INTO users (name, email, password, age)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `, [name, email, password, age]
    );
    return result;
};

const getAllUsers = async () => {
    const result = await pool.query(`
            SELECT * FROM users
            `);

    return result;
};

// get single user
const getUserById = async (id: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result;
};
// update user
const updateUser = async (id: string, paload: IUser) => {
    const { name, email, password, age } = paload;

    const result = await pool.query(`
            UPDATE users
            SET name =COALESCE($1, name), email = $2, password = $3, age = $4
            WHERE id = $5
            RETURNING *
            `, [name, email, password, age, id]);

    return result;
};
// DELETE USER
const deleteUser = async (id: string) => {
    const result = await pool.query(`
            DELETE FROM users
            WHERE id = $1
            RETURNING *
            `, [id]);

    return result;
};

export const UserService = {
    createUserIntoDB,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}