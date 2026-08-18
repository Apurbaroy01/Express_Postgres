import express, { type Application, type Request, type Response } from "express";
import { pool } from "./db";
import { userRoutes } from "./modules/user/user.routes";

const app: Application = express()

app.use(express.json());


app.use("/", userRoutes);


// create user
// app.post("/user/api", async (req: Request, res: Response) => {
//     const { name, email, password, age } = req.body;

//     try {
//         const result = await pool.query(`
//         INSERT INTO users (name, email, password, age)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//         `, [name, email, password, age]
//         );

//         res.status(200).json({ message: 'User created successfully', user: result.rows[0] });
//     } catch (error: any) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ message: 'Error creating user' });
//     }
// });

// get all users
// app.get("/user/api", async (req: Request, res: Response) => {
//     try {
//         const result = await pool.query(`
//             SELECT * FROM users
//             `);
//         res.status(200).json({ success: true, message: 'Users fetched successfully', users: result.rows });
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ message: 'Error fetching users' });
//     }
// });

// get single user
app.get("/user/api/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT * FROM users
            WHERE id = $1
            `, [id]);

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User fetched successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// update user
app.put("/user/api/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password, age } = req.body;
    try {
        const result = await pool.query(`
            UPDATE users
            SET name =COALESCE($1, name), email = $2, password = $3, age = $4
            WHERE id = $5
            RETURNING *
            `, [name, email, password, age, id]);
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE USER
app.delete("/user/api/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            DELETE FROM users
            WHERE id = $1
            RETURNING *
            `, [id]);

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

export default app;