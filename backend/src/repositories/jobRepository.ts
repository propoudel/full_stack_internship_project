import { prisma } from "../config/prisma";
import { Job, PrismaClient, EmploymentType, JobStatus } from "@prisma/client";

export class JobRepository {
    public async create(data: {
        title: string;
        description: string;
        requirements: string;
        location: string;
        employmentType?: EmploymentType;
        experienceLevel: string;
        salaryMin: number;
        salaryMax: number;
        deadline: Date;
        companyId: number;

    }): Promise<Job> {
        return prisma.job.create({ data });
    }

    public async findAll(): Promise<Job[]> {
        return prisma.job.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    public async findById(id: number): Promise<Job | null> {
        return prisma.job.findUnique({
            where: { id }
        });
    }

    public async findByCompanyId(companyId: number): Promise<Job[]> {
        return prisma.job.findMany({
            where: { companyId },
            orderBy: { createdAt: "desc" },
        });
    }

    public async update(
        id: number,
        data: Partial<{
            title: string;
            description: string;
            requirements: string;
            location: string;
            employmentType: "FullTime" | "PartTime" | "Contract" | "Internship" | "Remote";
            experienceLevel: string;
            salaryMin: number;
            salaryMax: number;
            deadline: Date;
            status: JobStatus;

        }>
    ): Promise<Job> {
        return prisma.job.update({ where: { id }, data })
    }

    public async delete(id: number): Promise<Job> {
        return prisma.job.delete({ where: { id } });
    }

    public async findAllOpen(filters: {
        search?: string;
        location?: string;
        employmentType?: string;
        experienceLevel?: string;
        sortBy?: string;
        order?: "asc" | "desc";
        page?: number;
        limit?: number;
    }): Promise<{ jobs: Job[]; total: number }> {
        const { search, location, employmentType, experienceLevel, sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = filters;
        const where: any = { status: "Open" };
        if (search) {
            where.title = { contains: search, mode: "insensitive" };
        }
        if (location) {
            where.location = { contains: location, mode: "insensitive" };
        }
        if (employmentType) {
            where.employmentType = employmentType;
        }
        if (experienceLevel) {
            where.experienceLevel = experienceLevel;
        }

        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip,
                take: limit,
            }),
            prisma.job.count({ where }),
        ]);
        return { jobs, total };
    }
    public async findAllForAdmin(filters: {
        search?: string;
        status?: JobStatus;
        page?: number;
        limit?: number;
    }) {
        const { search, status, page = 1, limit = 10 } = filters;
        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { company: { name: { contains: search, mode: "insensitive" } } }
            ]
        }
        if (status) where.status = status;
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    company: { select: { id: true, name: true } },
                    _count: { select: { applications: true, savedBy: true } },
                },
            }),
            prisma.job.count({ where }),
        ]);

        return { jobs, total };
    }

    public async findByIdWithCounts(id: number) {
        return prisma.job.findUnique({
            where: { id },
            include: {
                company: { select: { id: true, name: true } },
                _count: { select: { applications: true, savedBy: true } },
            },
        });
    }

    public async updateStatus(id: number, status: JobStatus): Promise<Job> {
        return prisma.job.update({ where: { id }, data: { status } });
    }

    public async deleteWithRelations(id: number): Promise<void> {
        await prisma.$transaction([
            prisma.savedJob.deleteMany({ where: { jobId: id } }),
            prisma.application.deleteMany({ where: { jobId: id } }),
            prisma.job.delete({ where: { id } }),
        ]);
    }
}