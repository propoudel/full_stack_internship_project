import { Router } from "express";
import { UserController } from "../controllers/userController";
import {authMiddleware} from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";

const userRoutes = Router();
const userController = new UserController();

userRoutes.get("/", userController.getAllUsers);
userRoutes.get("/:id", userController.getUserById);
userRoutes.post("/",authMiddleware, authorizeRoles("Admin"), userController.createUser);
userRoutes.put("/:id", userController.updateUser);
userRoutes.delete("/:id", userController.deleteUser);

export default userRoutes;