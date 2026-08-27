import { Router } from "express";
import { authController } from "./auth.controller";

const route = Router();

route.post("/api/auth/login",authController.loginUser);
route.post("/api/refresh-token",authController.refreshToken);


export const authRoutes = route