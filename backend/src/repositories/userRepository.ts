import { Role, User } from '@prisma/client';
import { prisma } from '../config/prisma';

export class UserRepository {
    // Get all users from the database
    public async findAll(): Promise<User[]> {
        return prisma.user.findMany();
    }

    // Get a single user by their id
    // Returns null if no user is found with that id
    public async findById(id: number): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    public async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    // Create a new User in the database
    public async create(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role?: Role;
    }): Promise<User> {
        return prisma.user.create({ data });
    }

    // update an existing user by id
    public async update(
        id: number,
        data: Partial<{
            name: string;
            email: string;
            password: string;
            phone: string;
        }>
    ): Promise<User> {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    // delete a user by id
    public async delete(id: number): Promise<User> {
        return prisma.user.delete({ where: { id } });
    }
}