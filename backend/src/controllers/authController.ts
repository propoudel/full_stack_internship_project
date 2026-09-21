import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthRequest } from "../middlewares/authMiddleware";

const authService = new AuthService();

export class AuthController {

    //Register

    register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, phone } = req.body;

    const { user, token } = await authService.register({ name, email, password, phone });

    res.cookie("token", token,{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"lax",
        maxAge: 7 * 24 * 60 * 60 * 1000// 7 day
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user },
    });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Something went wrong during registration";

    return res.status(status).json({ success: false, message });
  }
};

    // login 

    login = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { email, password } = req.body;
            const {user,token} = await authService.login({ email, password });

            res.cookie("token", token,{
                httpOnly:true,
                secure: process.env.NODE_ENV === "production",
                sameSite:"lax",
                maxAge: 7 * 24 * 60 * 60 * 1000// 7 day

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

    // get /me

    getCurrentUser = async (req:AuthRequest, res:Response): Promise<Response>=>{
        try{
            const userId = req.user!.id;
            const user = await authService.getCurrentUser(userId);

            return res.status(200).json({
                success:true,
                data:user,
            });
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong";

            return res.status(status).json({
                sucess:false,
                message,
            })

        }
    }
}
