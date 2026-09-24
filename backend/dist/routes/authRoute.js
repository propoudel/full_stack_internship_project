"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateMiddleware_1 = require("../middlewares/validateMiddleware");
const authvalidator_1 = require("../validators/authvalidator");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController;
//post 
router.post("/register", (0, validateMiddleware_1.validate)(authvalidator_1.registerSchema), authController.register);
router.post("/login", (0, validateMiddleware_1.validate)(authvalidator_1.loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware_1.authMiddleware, authController.getCurrentUser);
router.get("/verify-email", authController.verifyEmail);
router.post("/refresh", authController.refresh);
exports.default = router;
