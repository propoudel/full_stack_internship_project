"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authService = new authService_1.AuthService();
class AuthController {
    constructor() {
        //Register
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, phone } = req.body;
                const user = yield authService.register({ name, email, password, phone });
                return res.status(201).json({
                    success: true,
                    message: "Registration successful",
                    data: user,
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong during registration";
                return res.status(status).json({ success: false, message });
            }
        });
        //verify email
        this.verifyEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.query.token;
                if (!token) {
                    return res.status(400).json({
                        success: false,
                        message: "Verification token is required",
                    });
                }
                yield authService.verifyEmail(token);
                return res.status(200).json({
                    success: true,
                    message: "Email verified successfully. You can now log in.",
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong during verification";
                return res.status(status).json({ success: false, message });
            }
        });
        //refresh token
        this.refresh = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                if (!refreshToken) {
                    return res.status(401).json({ sucess: true, message: "No refresh token provided" });
                }
                const newAccessToken = yield authService.refreshAccessToken(refreshToken);
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 1 * 60 * 1000,
                });
                return res.status(200).json({
                    sucess: true,
                    message: "Access token refreshed",
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong";
                return res.status(status).json({ sucess: false, message });
            }
        });
        // login 
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { user, accessToken, refreshToken } = yield authService.login({ email, password });
                // short-lived accessToken
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 15 * 60 * 1000 // 1min
                });
                // long lived refresh token cookie(7days)
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                return res.status(200).json({
                    success: true,
                    message: "Login sucessful",
                    data: {
                        user,
                    },
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong during loging";
                return res.status(status).json({
                    success: false,
                    message,
                });
            }
        });
        //logout 
        this.logout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                yield authService.logout(refreshToken);
                res.clearCookie("accessToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });
                return res.status(200).json({
                    sucess: true,
                    message: "Logged out sucessfully",
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong during logout";
                return res.status(status).json({ sucess: false, message });
            }
        });
        // get /me
        this.getCurrentUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const user = yield authService.getCurrentUser(userId);
                return res.status(200).json({
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong";
                return res.status(status).json({
                    sucess: false,
                    message,
                });
            }
        });
    }
}
exports.AuthController = AuthController;
