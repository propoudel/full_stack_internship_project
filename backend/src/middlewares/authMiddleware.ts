import { Request , Response , NextFunction} from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/jwtUtil";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request{
    user?: JwtPayload;
}

export const authMiddleware =(
    req:AuthRequest,
    res: Response,
    next:NextFunction
)=>{
    const token = req.cookies?.token;
    if(!token){
        return res.status(401).json({
            sucess:false,
            message:"No token provided",
        });
    }
    try{
        const decoded = jwt.verify(token , JWT_SECRET) as JwtPayload;
        req.user= decoded;
        next();
    }catch(error){
        return res.status(401).json({
            sucess:false,
            message:"Invalid or expired token",
        });
    }
};