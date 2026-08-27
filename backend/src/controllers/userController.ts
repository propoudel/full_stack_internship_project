import {Request, Response} from 'express';
import {UserService} from '../services/userService';

const userService = new UserService();

export class UserController{
    // get all users

    public async getAllUsers(req:Request, res:Response): Promise<Response>{
        try{
            const users = await userService.getAllUsers();
            return res.status(200).json({
                success:true,
                data:users,
            });
        }catch(error){
            return res.status(500).json({
                success:false,
                message:"Internal server error",
            });
        }
    }

    // get user by id

    public async getUserById(req:Request,res:Response):Promise<Response>{
        const id = Number(req.params.id);
        try{
            const user = await userService.getUserById(id);
            return res.status(200).json({
                success:true,
                data:user,
            });

        }catch(error){
            return res.status(404).json({
                success:false,
                message: "User not found",
            });
        }
    }

    // Post or create a user

    public async createUser(req:Request, res:Response): Promise<Response>{
        const {name, email, password, phone, role}= req.body;
        try{
            const user = await userService.createUser({
                name,
                email,
                password,
                phone,
                role,
            });
            return res.status(201).json({
                sucess: true,
                data:user,
                message:"User created sucessfully",
            })
        }catch(error:any){
            console.log(error);
            return res.status(500).json({
                sucess:false,
                message:"Error while creating user",
            });
        }
    }

    // Put/users/:id
    public async updateUser(req:Request, res:Response): Promise<Response>{
        try{
            const id = Number(req.params.id);
            const data = req.body;

            const user = await userService.updateUser(id,data);

            return res.status(200).json({
                success: true,
                data:user,
                message:"User updated sucessfully",
            });
        }catch(error){
            return res.status(500).json({
                sucess:false,
                message:"Internal server error",
            });
        }
    }

    // Delete a user /users/:id

    public async deleteUser(req:Request, res:Response): Promise<Response>{
        try{
            const id = Number (req.params.id);
            await userService.deleteUser(id);

            return res.sendStatus(200).json({
                sucess:true,
                message:"User deleted sucessfully",
            });
        }catch(error){
            return res.status(200).json({
                success:true,
                message:"User deleted sucessfully",
            });
        }
    }

}