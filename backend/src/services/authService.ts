import bcrypt from "bcrypt";
import {UserRepository} from "../repositories/userRepository";
import { User, Role} from "@prisma/client";
import { generateToken } from "../utils/jwtUtil";

const userRepository = new UserRepository();

export class AuthService{

    // handels new user registration

   public async register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<{ user: Omit<User, "password">; token: string }> {

  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw { status: 409, message: "Email already registered" };
  }

  // hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
    role: "User",
  });

  // Generate token immediately — no separate login required
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
  };
}

     public async getCurrentUser(userId: number): Promise<Omit<User, "password">>{
            const user = await userRepository.findById(userId);

            if(!user){
                throw {status :404, message:"User not found"};
            }

            const {password , ...userWithoutPassword} = user;
            return userWithoutPassword;
        }
        
    // login

    public async login(data:{
        email:string;
        password:string;
    }): Promise<{ user: Omit<User, "password">; token:string}>{

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

        // Generate token

        const token = generateToken({
            id:user.id,
            email:user.email,
            role:user.role,
        });


        //remove password before returning
        const {password, ...userWithoutPassword} = user;
        return {
            user:userWithoutPassword,
            token,
        };


    }
} 
