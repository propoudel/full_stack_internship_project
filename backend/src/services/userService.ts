import { UserRepository} from '../repositories/userRepository';
import {User,Role} from"@prisma/client";

const userRepository = new UserRepository();

export class UserService{
    // get all users
    public async getAllUsers(): Promise<User[]> {
        return userRepository.findAll();
    }

    // get user by id
    public async getUserById(id:number): Promise<User>{
        const user = await userRepository.findById(id);

        if(!user){
            throw new Error(`User with id ${id} not found`);
        }

        return user;
    }

    // Create a new User
    public async createUser(data:{
        name:string,
        email:string,
        password:string;
        phone:string,
        role?:Role;
    }): Promise<User>{
        const existingUser = await userRepository.findByEmail(data.email);

        if(existingUser){
            throw new Error("Email already registered");

        }
        return userRepository.create(data);
    }

    // update an existing user

    public async updateUser(
        id:number,
        data:Partial<{
            name:string,
            email:string,
            password:string,
            phone:string,
        }>
    ): Promise<User>{
        const existingUser = await userRepository.findById(id);
        if(!existingUser){
            throw {status:404,message:"User  not found"};
        }
        return userRepository.update(id, data);
    }

    // Delete a user
    public async deleteUser(id:number): Promise<User>{
        const existingUser = await userRepository.findById(id);

        if(!existingUser){
            throw {status:404,message:"User not found"};
    }
    return userRepository.delete(id);
}
}