import { Router } from "express";
import { userController } from "./user.contriller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();


router.post("/user/api", userController.createUser);
router.get("/user/api", auth(USER_ROLE.ADMIN), userController.getAllUsers);

// get single user
router.get("/user/api/:id", userController.getUserById);

// update user
router.put("/user/api/:id", userController.updateUser);

// DELETE USER
router.delete("/user/api/:id", userController.deleteUser);


export const userRoutes = router;