import express, { type Application } from "express";
import { userRoutes } from "./modules/user/user.routes";
import { ProfilesRoutes } from "./modules/userProfiles/profile.route";
import { authRoutes } from "./modules/auth/auth.routes";
import logger from "./middleware/logger";


const app: Application = express()

app.use(express.json());
app.use(logger);


app.get("/", (req, res) => res.send("Hello World!"));

app.use("/", userRoutes);
app.use("/", ProfilesRoutes);
app.use("/", authRoutes);


export default app;