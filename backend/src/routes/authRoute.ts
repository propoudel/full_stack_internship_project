import {Router} from "express";
import {AuthController} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { registerSchema, loginSchema } from "../validators/authvalidator";

const router = Router();
const authController = new AuthController;

//post 

router.post("/register",validate(registerSchema),authController.register);
router.post("/login",validate(loginSchema),authController.login);
router.post("/logout",authController.logout);
router.get("/me",authMiddleware, authController.getCurrentUser)
router.get("/verify-email", authController.verifyEmail);
router.post("/refresh", authController.refresh);
export default router;