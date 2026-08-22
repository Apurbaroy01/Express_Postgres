import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: any) => {
    const { email, password } = payload;

    // query user
    const userData = await pool.query(`
        SELECT * FROM users
        WHERE email = $1
        `, [email]
    );
    if (userData.rows.length === 0) {
        throw new Error('User not found');
    }
    const user = userData.rows[0];

    // check password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        throw new Error('Invalid password');
    }

    // generate token
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        is_active: user.is_active
    }
    const accessToken = jwt.sign(jwtPayload, config.secret as string, { expiresIn: "1d" });

    return  { accessToken };
}

export const authServices = {
    loginUserIntoDB
}