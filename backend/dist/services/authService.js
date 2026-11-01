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
const crypto_1 = __importDefault(require("crypto"));
const userRepository_1 = require("../repositories/userRepository");
const refreshTokenRepository_1 = require("../repositories/refreshTokenRepository");
const jwtUtil_1 = require("../utils/jwtUtil");
const emailUtils_1 = require("../utils/emailUtils");
const userRepository = new userRepository_1.UserRepository();
const refreshTokenRepository = new refreshTokenRepository_1.RefreshTokenRepository();
// Strips every field that must never be sent to the client
const toSafeUser = (user) => {
    const { password, verificationToken, verificationTokenExpiry } = user, safeUser = __rest(user, ["password", "verificationToken", "verificationTokenExpiry"]);
    return safeUser;
};
const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
class AuthService {
    // Handles new user registration
    register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationToken = crypto_1.default.randomBytes(32).toString("hex");
            const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);
            const existingUser = yield userRepository.findByEmail(data.email);
            if (existingUser) {
                if (existingUser.isVerified) {
                    throw { status: 409, message: "Email already registered" };
                }
                // Email exists but was never verified. Keep the original name, phone and
                // password (otherwise anyone could take over someone else's pending
                // account), and only send a fresh verification link.
                const refreshedUser = yield userRepository.update(existingUser.id, {
                    verificationToken,
                    verificationTokenExpiry,
                });
                yield (0, emailUtils_1.sendVerificationEmail)(refreshedUser.email, refreshedUser.name, verificationToken);
                return toSafeUser(refreshedUser);
            }
            // Brand new email
            const existingPhone = yield userRepository.findByPhone(data.phone);
            if (existingPhone) {
                throw { status: 409, message: "Phone number already registered" };
            }
            const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
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
            yield (0, emailUtils_1.sendVerificationEmail)(user.email, user.name, verificationToken);
            return toSafeUser(user);
        });
    }
    getCurrentUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findById(userId);
            if (!user) {
                throw { status: 404, message: "User not found" };
            }
            return toSafeUser(user);
        });
    }
    // Verify email
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findByVerificationToken(token);
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
    // Exchange a refresh token for a new access token
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
            return (0, jwtUtil_1.generateAccessToken)({
                id: user.id,
                email: user.email,
                role: user.role,
            });
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findByEmail(data.email);
            if (!user) {
                throw { status: 401, message: "Invalid email or password" };
            }
            const isPasswordCorrect = yield bcrypt_1.default.compare(data.password, user.password);
            if (!isPasswordCorrect) {
                throw { status: 401, message: "Invalid email or password" };
            }
            // These two checks come after the password check on purpose, so someone who
            // doesn't know the password can't learn the account's status
            if (!user.isVerified) {
                throw {
                    status: 403,
                    message: `Please verify your email before logging in. Check the inbox for ${user.email}.`,
                };
            }
            if (!user.isActive) {
                throw {
                    status: 403,
                    message: "Your account has been deactivated. Please contact support.",
                };
            }
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
            return { user: toSafeUser(user), accessToken, refreshToken };
        });
    }
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (refreshToken) {
                yield refreshTokenRepository.deleteByToken(refreshToken);
            }
        });
    }
}
exports.AuthService = AuthService;
