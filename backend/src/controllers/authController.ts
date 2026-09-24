import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ref } from "process";

const authService = new AuthService();

export class AuthController {

    //Register

    register = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name, email, password, phone } = req.body;

            const user = await authService.register({ name, email, password, phone });

            return res.status(201).json({
                success: true,
                message: "Registration successful",
                data: user,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong during registration";

            return res.status(status).json({ success: false, message });
        }
    };
    //verify email
    verifyEmail = async (req: Request, res: Response): Promise<Response> => {
        try {
            const token = req.query.token as string;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "Verification token is required",
                });
            }

            await authService.verifyEmail(token);

            return res.status(200).json({
                success: true,
                message: "Email verified successfully. You can now log in.",
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong during verification";
            return res.status(status).json({ success: false, message });
        }
    };

    //refresh token
    refresh = async(req:Request , res:Response): Promise<Response> =>{
        try{
            const refreshToken = req.cookies?.refreshToken;

            if(!refreshToken){
                return res.status(401).json({sucess:true, message:"No refresh token provided"});
            }

            const newAccessToken = await authService.refreshAccessToken(refreshToken);

            res.cookie("accessToken", newAccessToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"lax",
                maxAge : 1*60*1000,
            });
            return res.status(200).json({
                sucess:true,
                message:"Access token refreshed",
            });
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong";

            return res.status(status).json({sucess:false, message});
        }
    }

    // login 

    login = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await authService.login({ email, password });

            // short-lived accessToken
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 15 * 60 * 1000// 1min

            });

            // long lived refresh token cookie(7days)
            res.cookie("refreshToken",refreshToken,{
                httpOnly:true,
                secure: process.env.NODE_ENV === "production",
                sameSite:"lax",
                maxAge: 7*24*60*60*1000,
            })
            return res.status(200).json({
                success: true,
                message: "Login sucessful",
                data: {
                    user,
                },
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong during loging";

            return res.status(status).json({
                success: false,
                message,
            });
        }
    }

    //logout 
    logout = async (req:Request, res:Response): Promise<Response> =>{
        try{
            const refreshToken = req.cookies?.refreshToken;
            await authService.logout(refreshToken);

            res.clearCookie("accessToken",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"lax",
            });

            res.clearCookie("refreshToken",{
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:"lax",
            });

            return res.status(200).json({
                sucess:true,
                message:"Logged out sucessfully",
            })
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong during logout";
            return res.status(status).json({sucess:false,message});
        }
    }


    // get /me

    getCurrentUser = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const user = await authService.getCurrentUser(userId);

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";

            return res.status(status).json({
                sucess: false,
                message,
            })

        }
    }
}
