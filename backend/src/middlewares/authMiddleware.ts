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
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({
            sucess:false,
            message:"No token provided",
        });
    }

    const token = authHeader.split(" ")[1];

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