import express, { type Application, type Request, type Response } from "express";
import {Pool} from "pg";
const app: Application = express()
const port = 5000

app.use(express.json());


const pool = new Pool({
    connectionString:"postgresql://neondb_owner:npg_P7MSOnVsU2Tv@ep-withered-tree-ay8poq77-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello World!' })
});

app.post("/", async(req: Request, res: Response) => {
    console.log(req.body);
    res.status(200).json({ message: req.body });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})