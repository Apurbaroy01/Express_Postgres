import express, { type Application} from "express";
import { userRoutes } from "./modules/user/user.routes";
import { ProfilesRoutes } from "./modules/userProfiles/profile.route";
import { authRoutes } from "./modules/auth/auth.routes";

const app: Application = express()

app.use(express.json());

app.use("/", userRoutes);
app.use("/", ProfilesRoutes);
app.use("/", authRoutes);


export default app;