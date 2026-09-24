import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;
const ACCESS_TOKEN_EXPIRES_IN="15m"
const REFRESH_TOKEN_EXPIRES_IN_DAYS =  7;

export interface JwtPayload{
    id:number;
    email:string;
    role:string;
}

export const generateAccessToken = (payload:JwtPayload): string =>{
    return jwt.sign(payload, JWT_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRES_IN}as jwt.SignOptions) ;
}

export const generateRefreshToken =():string =>{
    return require("crypto").randomBytes(40).toString("hex");
}

export const REFRESH_TOKEN_EXPIRY_MS= REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;