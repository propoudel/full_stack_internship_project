"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController;
//post 
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware_1.authMiddleware, authController.getCurrentUser);
exports.default = router;
