import {Router} from "express";
import {AuthController} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const authController = new AuthController;

//post 

router.post("/register",authController.register);
router.post("/login",authController.login);
router.get("/me",authMiddleware, authController.getCurrentUser)

export default router;