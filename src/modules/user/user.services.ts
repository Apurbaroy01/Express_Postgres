import { pool } from "../../db";

const createUserIntoDB = async (paload: any) => {
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

export const UserService = {
    createUserIntoDB,
    getAllUsers
}