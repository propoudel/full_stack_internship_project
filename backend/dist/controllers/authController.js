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
                const { name, email, password, phone, role } = req.body;
                const user = yield authService.register({
                    name,
                    email,
                    password,
                    phone,
                    role,
                });
                return res.status(201).json({
                    success: true,
                    message: "Registration sucessful",
                    data: user,
                });
            }
            catch (error) {
                const status = error.status || 500;
                const message = error.message || "Something went wrong during registration";
                return res.status(status).json({
                    success: false,
                    message,
                });
            }
        });
        // login 
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield authService.login({ email, password });
                return res.status(200).json({
                    success: true,
                    message: "Login sucessful",
                    data: user,
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
    }
}
exports.AuthController = AuthController;
