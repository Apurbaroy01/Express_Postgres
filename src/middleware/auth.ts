import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";


type ROLES = "admin" | "user";

const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // console.log("token:", token);

            const decodedToken = jwt.verify(token, config.secret as string) as JwtPayload;
            // console.log("decodedToken:", decodedToken);

            if (!decodedToken) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const userData = await pool.query(`
            SELECT * FROM users
            WHERE email = $1
            `, [decodedToken.email]
            );
            if (userData.rows.length === 0) {
                return res.status(401).json({ success: false, message: "user not found" });
            }
            const user = userData.rows[0];
            console.log("user:", user);

            if (!user?.is_active) {
                return res.status(401).json({ success: false, message: "user is not active" });
            }

            if (roles.length && !roles.includes(user.role)) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    }
}

export default auth;