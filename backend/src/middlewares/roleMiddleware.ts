import {Request, Response ,NextFunction} from "express";
import { AuthRequest } from "./authMiddleware";

export const authorizeRoles = (...allowedRoles: string[])=>{
    return (req:AuthRequest, res:Response, next:NextFunction)=>{
        const userRole = req.user?.role;

        if(!userRole || !allowedRoles.includes(userRole)){
            return res.status(403).json({
                sucess:false,
                message:"You don't have permission to perform this action",
            });
        }

        next();
    };
};