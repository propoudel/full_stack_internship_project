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

    public async findAllOpen(): Promise<Job[]> {
        return prisma.job.findMany({
            where: { status: "Open" },
            orderBy: { createdAt: "desc" },
        });
    }
}