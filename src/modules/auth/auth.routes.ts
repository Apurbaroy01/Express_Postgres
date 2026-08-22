import { Router } from "express";
import { authController } from "./auth.controller";

const route = Router();

route.post("/api/auth/login",authController.loginUser);


export const authRoutes = route