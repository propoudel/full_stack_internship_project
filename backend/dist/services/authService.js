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
const jwtUtil_1 = require("../utils/jwtUtil");
const refreshTokenRepository_1 = require("../repositories/refreshTokenRepository");
const crypto_1 = __importDefault(require("crypto"));
const emailUtils_1 = require("../utils/emailUtils");
const userRepository = new userRepository_1.UserRepository();
const refreshTokenRepository = new refreshTokenRepository_1.RefreshTokenRepository();
class AuthService {
    // handels new user registration
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userRepository.findByEmail(data.email);
            if (existingUser) {
                if (existingUser.isVerified) {
                    throw { status: 409, message: "Email already registered" };
                }
                //for existing email but not verified
                const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
                const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
                const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const updatedUser = yield userRepository.update(existingUser.id, {
                    name: data.name,
                    password: hashedPassword,
                    phone: data.phone,
                    verificationToken,
                    verificationTokenExpiry,
                });
                yield (0, emailUtils_1.sendVerificationEmail)(updatedUser.email, updatedUser.name, verificationToken);
                const { password, verificationToken: _vt, verificationTokenExpiry: _vte } = updatedUser, safeUser = __rest(updatedUser, ["password", "verificationToken", "verificationTokenExpiry"]);
                return safeUser;
            }
            //Brand new email- normal registration flow
            // hash password
            const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
            //Generating ramdom verification code
            const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
            const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const user = yield userRepository.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                role: "User",
                isVerified: false,
                verificationToken,
                verificationTokenExpiry,
            });
            // sending verification email
            yield (0, emailUtils_1.sendVerificationEmail)(user.email, user.name, verificationToken);
            const { password, verificationToken: _vt, verificationTokenExpiry: _vte } = user, safeUser = __rest(user, ["password", "verificationToken", "verificationTokenExpiry"]);
            return safeUser;
        });
    }
    getCurrentUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findById(userId);
            if (!user) {
                throw { status: 404, message: "User not found" };
            }
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
    // verify email
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Received token:", token);
            const user = yield userRepository.findByVerificationToken(token);
            console.log("Found user:", user);
            if (!user) {
                throw { status: 400, message: "Invalid or expired verification link" };
            }
            if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
                throw { status: 400, message: "Verification link has expired. Please request a new one." };
            }
            yield userRepository.update(user.id, {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            });
        });
    }
    //refrence Token
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedToken = yield refreshTokenRepository.findByToken(refreshToken);
            if (!storedToken) {
                throw { status: 401, message: "Invalid refresh token" };
            }
            if (storedToken.expiresAt < new Date()) {
                yield refreshTokenRepository.deleteByToken(refreshToken);
                throw { status: 401, message: "Refresh token expired. Please log in again." };
            }
            const user = yield userRepository.findById(storedToken.userId);
            if (!user) {
                throw { status: 401, message: "User not found" };
            }
            const newAccessToken = (0, jwtUtil_1.generateAccessToken)({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            return newAccessToken;
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
            //blocking email if not verified
            if (!user.isVerified) {
                throw {
                    status: 403,
                    message: `Please verify your email before logging in. Check the inbox for ${user.email}.`,
                };
            }
            // Generate Accesstoken
            const accessToken = (0, jwtUtil_1.generateAccessToken)({
                id: user.id,
                email: user.email,
                role: user.role,
            });
            const refreshToken = (0, jwtUtil_1.generateRefreshToken)();
            const expiresAt = new Date(Date.now() + jwtUtil_1.REFRESH_TOKEN_EXPIRY_MS);
            yield refreshTokenRepository.create({
                token: refreshToken,
                userId: user.id,
                expiresAt,
            });
            //remove password before returning
            const { password, verificationToken, verificationTokenExpiry } = user, safeUser = __rest(user, ["password", "verificationToken", "verificationTokenExpiry"]);
            return {
                user: safeUser,
                accessToken,
                refreshToken,
            };
        });
    }
    // logout
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (refreshToken) {
                yield refreshTokenRepository.deleteByToken(refreshToken);
            }
        });
    }
}
exports.AuthService = AuthService;
