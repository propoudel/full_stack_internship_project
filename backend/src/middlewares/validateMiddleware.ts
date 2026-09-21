import { Request , Response , NextFunction} from "express";
import { ZodType,z } from "zod";

export const validate = (schema:ZodType)=>{
    return (req:Request , res:Response , next:NextFunction)=>{
        const result = schema.safeParse(req.body);
        if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
            return res.status(400).json({
                success:false,
                message:"Validation failed",
                errors:formattedErrors,
            });
        }
        req.body = result.data;
        next();
    };
}