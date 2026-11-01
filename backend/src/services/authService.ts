import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "@prisma/client";
import { UserRepository } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_EXPIRY_MS,
} from "../utils/jwtUtil";
import { sendVerificationEmail } from "../utils/emailUtils";

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();

type SafeUser = Omit<User, "password" | "verificationToken" | "verificationTokenExpiry">;

// Strips every field that must never be sent to the client
const toSafeUser = (user: User): SafeUser => {
  const { password, verificationToken, verificationTokenExpiry, ...safeUser } = user;
  return safeUser;
};

const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

export class AuthService {
  // Handles new user registration
  public async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<SafeUser> {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);

    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw { status: 409, message: "Email already registered" };
      }

      // Email exists but was never verified. Keep the original name, phone and
      // password (otherwise anyone could take over someone else's pending
      // account), and only send a fresh verification link.
      const refreshedUser = await userRepository.update(existingUser.id, {
        verificationToken,
        verificationTokenExpiry,
      });

      await sendVerificationEmail(refreshedUser.email, refreshedUser.name, verificationToken);

      return toSafeUser(refreshedUser);
    }

    // Brand new email
    const existingPhone = await userRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw { status: 409, message: "Phone number already registered" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: "User",
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    return toSafeUser(user);
  }

  public async getCurrentUser(userId: number): Promise<SafeUser> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    return toSafeUser(user);
  }

  // Verify email
  public async verifyEmail(token: string): Promise<void> {
    const user = await userRepository.findByVerificationToken(token);

    if (!user) {
      throw { status: 400, message: "Invalid or expired verification link" };
    }

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      throw { status: 400, message: "Verification link has expired. Please request a new one." };
    }

    await userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });
  }

  // Exchange a refresh token for a new access token
  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw { status: 401, message: "Invalid refresh token" };
    }

    if (storedToken.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw { status: 401, message: "Refresh token expired. Please log in again." };
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user) {
      throw { status: 401, message: "User not found" };
    }

    return generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  public async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
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

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return { user: toSafeUser(user), accessToken, refreshToken };
  }

  public async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await refreshTokenRepository.deleteByToken(refreshToken);
    }
  }
}