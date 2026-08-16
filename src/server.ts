import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";
import "dotenv/config";
const app: Application = express()
const port = 5000

app.use(express.json());


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) NOT NULL,
                email VARCHAR(20) UNIQUE NOT NULL,
                password VARCHAR(20) NOT NULL,
                age INT NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

            )
        `);
        console.log('Table created successfully');
    } catch (err: any) {
        console.error('Error creating table:', err);
    }
};

initDB().catch(console.error);


// create user
app.post("/", async (req: Request, res: Response) => {
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
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})