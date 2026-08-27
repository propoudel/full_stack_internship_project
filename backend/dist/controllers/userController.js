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
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const userService = new userService_1.UserService();
class UserController {
    // get all users
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userService.getAllUsers();
                return res.status(200).json({
                    success: true,
                    data: users,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        });
    }
    // get user by id
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            try {
                const user = yield userService.getUserById(id);
                return res.status(200).json({
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
        });
    }
    // Post or create a user
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, phone, role } = req.body;
            try {
                const user = yield userService.createUser({
                    name,
                    email,
                    password,
                    phone,
                    role,
                });
                return res.status(201).json({
                    sucess: true,
                    data: user,
                    message: "User created sucessfully",
                });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({
                    sucess: false,
                    message: "Error while creating user",
                });
            }
        });
    }
    // Put/users/:id
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                const data = req.body;
                const user = yield userService.updateUser(id, data);
                return res.status(200).json({
                    success: true,
                    data: user,
                    message: "User updated sucessfully",
                });
            }
            catch (error) {
                return res.status(500).json({
                    sucess: false,
                    message: "Internal server error",
                });
            }
        });
    }
    // Delete a user /users/:id
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = Number(req.params.id);
                yield userService.deleteUser(id);
                return res.sendStatus(200).json({
                    sucess: true,
                    message: "User deleted sucessfully",
                });
            }
            catch (error) {
                return res.status(200).json({
                    success: true,
                    message: "User deleted sucessfully",
                });
            }
        });
    }
}
exports.UserController = UserController;
