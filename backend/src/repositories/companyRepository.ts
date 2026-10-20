import { PrismaClient, Company } from "@prisma/client";
import { prisma } from "../config/prisma";

export class CompanyRepository {

    //Find a company by its owner's user id
    public async findByOwnerId(ownerId: number): Promise<Company | null> {
        return prisma.company.findUnique({ where: { ownerId } });
    }

    // Find a company by its own id
    public async findById(id: number): Promise<Company | null> {
        return prisma.company.findUnique({ where: { id } });
    }

    //Get all companies
    public async findAll(): Promise<Company[]> {
        return prisma.company.findMany({
            orderBy: { createdAt: "desc" },
        })
    }

    // Create a new company
    public async create(data: {
        name: string;
        description: string;
        logo: string;
        website: string;
        email: string;
        phone: string;
        address: string;
        ownerId: number;
        industry: string;
        companySize: string;
    }): Promise<Company> {
        return prisma.company.create({ data });
    }

    // Update a company by id

    public async update(id: number, data: Partial<{
        name: string;
        description: string;
        logo: string;
        website: string;
        email: string;
        phone: string;
        address: string;
        companySize: string;
        industry: string;
    }>): Promise<Company> {
        return prisma.company.update({ where: { id }, data });
    }

    // delete a company by id
    public async delete(id: number): Promise<Company> {
        return prisma.company.delete({ where: { id } });
    }

    // List companies for the admin, with owner info and job counts
    public async findAllForAdmin(filters: {
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const { search, page = 1, limit = 10 } = filters;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { industry: { contains: search, mode: "insensitive" } },
            ];
        }

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    owner: { select: { id: true, name: true, email: true } },
                    _count: { select: { jobs: true } },
                },
            }),
            prisma.company.count({ where }),
        ]);

        return { companies, total };
    }

    public async findByIdWithCounts(id: number) {
        return prisma.company.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                _count: { select: { jobs: true } },
            },
        });
    }

    public async countApplications(companyId: number): Promise<number> {
        return prisma.application.count({ where: { job: { companyId } } });
    }

    public async findByEmail(email: string): Promise<Company | null> {
        return prisma.company.findUnique({ where: { email } });
    }

    public async findByPhone(phone: string): Promise<Company | null> {
        return prisma.company.findUnique({ where: { phone } });
    }

    // Deletes a company and everything that depends on it, all-or-nothing
    public async deleteWithRelations(id: number): Promise<void> {
        await prisma.$transaction([
            prisma.savedJob.deleteMany({ where: { job: { companyId: id } } }),
            prisma.application.deleteMany({ where: { job: { companyId: id } } }),
            prisma.job.deleteMany({ where: { companyId: id } }),
            prisma.company.delete({ where: { id } }),
        ]);
    }
}