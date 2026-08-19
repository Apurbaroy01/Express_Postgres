import { Router } from "express";
import { createUser, getAllUsers } from "./user.contriller";


const router = Router();

router.post("/user/api", createUser);
router.get("/user/api", getAllUsers);


export const userRoutes = router;