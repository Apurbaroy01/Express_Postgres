import express, { type Application} from "express";
import { userRoutes } from "./modules/user/user.routes";

const app: Application = express()

app.use(express.json());

app.use("/", userRoutes);


export default app;