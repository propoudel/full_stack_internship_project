import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {

    //Register

    register = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name, email, password, phone, role } = req.body;

            const user = await authService.register({
                name,
                email,
                password,
                phone,
                role,
            });

            return res.status(201).json({
                success: true,
                message: "Registration sucessful",
                data: user,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong during registration";

            return res.status(status).json({
                success: false,
                message,
            });
        }

    }

    // login 

    login = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { email, password } = req.body;
            const user = await authService.login({ email, password });

            return res.status(200).json({
                success: true,
                message: "Login sucessful",
                data: user,
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
}
