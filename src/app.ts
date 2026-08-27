import express, { type Application } from "express";
import { userRoutes } from "./modules/user/user.routes";
import { ProfilesRoutes } from "./modules/userProfiles/profile.route";
import { authRoutes } from "./modules/auth/auth.routes";
import logger from "./middleware/logger";
import cookieParser from "cookie-parser"
import cors from 'cors';
import globalErrorHandler from "./middleware/globalErrorHandeler";


const app: Application = express()

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: '*',
}))
app.use(logger);




app.get("/", (req, res) => res.send("Hello World!"));

app.use("/", userRoutes);
app.use("/", ProfilesRoutes);
app.use("/", authRoutes);
app.use(globalErrorHandler);


export default app;