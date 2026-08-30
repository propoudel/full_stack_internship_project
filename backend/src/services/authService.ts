import bcrypt from "bcrypt";
import {UserRepository} from "../repositories/userRepository";
import { User, Role} from "@prisma/client";


const userRepository = new UserRepository();

export class AuthService{

    // handels new user registration

    public async register(data:{
        name:string;
        email:string;
        password:string;
        phone:string;
        role?:Role;
    }): Promise<Omit<User, "password">>{

        const existingUser = await userRepository.findByEmail(data.email);
        if(existingUser){
            throw {status:409, message:"Email already registered"};
        }

        // hash password
    const hashedPassword = await bcrypt.hash(data.password,10);

    const user = await userRepository.create({
        name:data.name,
        email:data.email,
        password:hashedPassword,
        phone:data.phone,
        role:data.role,
    });
    
    const {password, ...userWithoutPassword} = user;
    return userWithoutPassword;
    }

    // login

    public async login(data:{
        email:string;
        password:string;
    }): Promise<Omit<User, "password">>{

        //find user by email
        const user = await userRepository.findByEmail(data.email);
        if(!user){
            throw {
                status:401,
                message:"Invalid email or password",
            }
        }
        // check password with hashed password
        const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
        if(!isPasswordCorrect){
            throw{
                status:401,
                message:"Invalid email or password"
            }
        }

        //remove password before returning
        const {password, ...userWithoutPassword} = user;
        return userWithoutPassword
    }
} 
