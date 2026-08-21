import { Router } from "express";
import { profileController } from "./profile.controller";

const router = Router();

router.post("/api/profiles", profileController.createProfile);

export const ProfilesRoutes = router;