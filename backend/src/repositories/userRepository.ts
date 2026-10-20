import { Role, User } from '@prisma/client';
import { prisma } from '../config/prisma';

const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    isVerified: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};
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
    public async findByVerificationToken(token: string): Promise<User | null> {
        return prisma.user.findFirst({ where: { verificationToken: token } });
    }

    // Create a new User in the database
    public async create(data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        role?: Role;
        isVerified?: boolean,
        verificationToken?: string,
        verificationTokenExpiry?: Date,
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
            role: Role;
            isVerified: boolean;
            isActive: boolean;
            verificationToken: string | null;
            verificationTokenExpiry: Date | null;
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

    // Get all users for admin with optional filters
    public async findAllForAdmin(filters: {
        search?: string;
        role?: Role;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { search, role, isActive, page = 1, limit = 10 } = filters;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) where.role = role;
        if (isActive !== undefined) where.isActive = isActive;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: safeUserSelect,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total };
    }

    public async findByIdForAdmin(id: number) {
        return prisma.user.findUnique({ where: { id }, select: safeUserSelect });
    }
}