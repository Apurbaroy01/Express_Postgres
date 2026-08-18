import { Router } from "express";
import { createUser } from "./user.contriller";
import { getAllUsers } from "./user.services";

const router = Router();

router.post("/user/api", createUser);
router.get("/user/api", getAllUsers);


export const userRoutes = router;