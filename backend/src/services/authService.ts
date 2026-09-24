import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/userRepository";
import { User, Role } from "@prisma/client";
import { generateRefreshToken,generateAccessToken,REFRESH_TOKEN_EXPIRY_MS } from "../utils/jwtUtil";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/emailUtils";

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();

export class AuthService {

    // handels new user registration

    public async register(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
    }): Promise<Omit<User, "password" | "verificationToken" | "verificationTokenExpiry">> {

        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            if(existingUser.isVerified){
            throw { status: 409, message: "Email already registered" };
        }

        //for existing email but not verified
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updatedUser = await userRepository.update(existingUser.id, {
      name: data.name,
      password: hashedPassword,
      phone: data.phone,
      verificationToken,
      verificationTokenExpiry,
    });

    await sendVerificationEmail(updatedUser.email, updatedUser.name, verificationToken);

    const { password, verificationToken: _vt, verificationTokenExpiry: _vte, ...safeUser } = updatedUser;
    return safeUser;
  }
    
        //Brand new email- normal registration flow
        // hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        //Generating ramdom verification code
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

        // sending verification email
        await sendVerificationEmail(user.email, user.name, verificationToken);
        const { password, verificationToken:_vt, verificationTokenExpiry: _vte, ...safeUser } = user;
        return safeUser;
    }

    public async getCurrentUser(userId: number): Promise<Omit<User, "password">> {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // verify email
    public async verifyEmail(token: string): Promise<void> {
        console.log("Received token:", token);
        const user = await userRepository.findByVerificationToken(token);
        console.log("Found user:", user);

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

        //refrence Token

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

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return newAccessToken;
}


    // login

    public async login(data: {
        email: string;
        password: string;
    }): Promise<{ user: Omit<User, "password" | "verificationToken" | "verificationTokenExpiry">; accessToken: string; refreshToken: string }> {

        //find user by email
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw {
                status: 401,
                message: "Invalid email or password",
            }
        }
        // check password with hashed password
        const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
        if (!isPasswordCorrect) {
            throw {
                status: 401,
                message: "Invalid email or password"
            }
        }

        //blocking email if not verified

        if (!user.isVerified) {
            throw {
                status: 403,
                message: `Please verify your email before logging in. Check the inbox for ${user.email}.`,
            };
        }


        // Generate Accesstoken

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now()+ REFRESH_TOKEN_EXPIRY_MS)

        await refreshTokenRepository.create({
            token:refreshToken,
            userId:user.id,
            expiresAt,
        })


        //remove password before returning
        const { password, verificationToken, verificationTokenExpiry, ...safeUser } = user;
        return {
            user: safeUser,
            accessToken,
            refreshToken,
        };


    }

    // logout
    public async logout(refreshToken:string): Promise<void>{
        if(refreshToken){
            await refreshTokenRepository.deleteByToken(refreshToken);
        }
    }
} 
