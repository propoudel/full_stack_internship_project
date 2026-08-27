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
exports.UserService = void 0;
const userRepository_1 = require("../repositories/userRepository");
const userRepository = new userRepository_1.UserRepository();
class UserService {
    // get all users
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return userRepository.findAll();
        });
    }
    // get user by id
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findById(id);
            if (!user) {
                throw new Error(`User with id ${id} not found`);
            }
            return user;
        });
    }
    // Create a new User
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userRepository.findByEmail(data.email);
            if (existingUser) {
                throw new Error("Email already registered");
            }
            return userRepository.create(data);
        });
    }
    // update an existing user
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userRepository.findById(id);
            if (!existingUser) {
                throw { status: 404, message: "User  not found" };
            }
            return userRepository.update(id, data);
        });
    }
    // Delete a user
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userRepository.findById(id);
            if (!existingUser) {
                throw { status: 404, message: "User not found" };
            }
            return userRepository.delete(id);
        });
    }
}
exports.UserService = UserService;
