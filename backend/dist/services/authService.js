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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRepository_1 = require("../repositories/userRepository");
const userRepository = new userRepository_1.UserRepository();
class AuthService {
    // handels new user registration
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userRepository.findByEmail(data.email);
            if (existingUser) {
                throw { status: 409, message: "Email already registered" };
            }
            // hash password
            const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
            const user = yield userRepository.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                role: data.role,
            });
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
    // login
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            //find user by email
            const user = yield userRepository.findByEmail(data.email);
            if (!user) {
                throw {
                    status: 401,
                    message: "Invalid email or password",
                };
            }
            // check password with hashed password
            const isPasswordCorrect = yield bcrypt_1.default.compare(data.password, user.password);
            if (!isPasswordCorrect) {
                throw {
                    status: 401,
                    message: "Invalid email or password"
                };
            }
            //remove password before returning
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
}
exports.AuthService = AuthService;
