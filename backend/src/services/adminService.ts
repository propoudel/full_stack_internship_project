import { prisma } from "../config/prisma";
import { User, Role, JobStatus, ApplicationStatus } from "@prisma/client";
import { UserRepository } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { CompanyRepository } from "../repositories/companyRepository";
import { UpdateCompanyInput } from "../validators/companyValidator";
import { JobRepository } from "../repositories/jobRepository";
import { ApplicationRepository } from "../repositories/applicationRepository";

const companyRepository = new CompanyRepository();
const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const jobRepository = new JobRepository();
const applicationRepository = new ApplicationRepository();

export class AdminService {
    public async getPlatformStats() {
        const [totalUsers, totalCompanies, totalJobs, openJobs, totalApplications] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.job.count(),
            prisma.job.count({ where: { status: "Open" } }),
            prisma.application.count()
        ]);
        const usersByRole = await prisma.user.groupBy({
            by: ["role"],
            _count: { role: true }
        });

        return {
            totalUsers,
            totalCompanies,
            totalJobs,
            openJobs,
            totalApplications,
            usersByRole: usersByRole.map((role) => ({
                role: role.role,
                count: role._count.role
            }))
        };
    }

    public async getUsers(filters: {
        search?: string;
        role?: Role;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { users, total } = await userRepository.findAllForAdmin(filters);

        const page = filters.page || 1;
        const limit = filters.limit || 10;

        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    public async getUserById(userId: number) {
        const user = await userRepository.findByIdForAdmin(userId);

        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        return user;
    }

    public async updateUserRole(adminId: number, userId: number, role: Role) {
        if (adminId === userId) {
            throw { status: 400, message: "You cannot change your own role" };
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        await userRepository.update(userId, { role });

        return userRepository.findByIdForAdmin(userId);
    }

    public async updateUserStatus(adminId: number, userId: number, isActive: boolean) {
        if (adminId === userId) {
            throw { status: 400, message: "You cannot deactivate your own account" };
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        await userRepository.update(userId, { isActive });

        // Deactivated users shouldn't be able to refresh their session
        if (!isActive) {
            await refreshTokenRepository.deleteAllForUser(userId);
        }

        return userRepository.findByIdForAdmin(userId);
    }

    public async getCompanies(filters: {
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const { companies, total } = await companyRepository.findAllForAdmin(filters);

        const page = filters.page || 1;
        const limit = filters.limit || 10;

        return { companies, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    public async getCompanyById(companyId: number) {
        const company = await companyRepository.findByIdWithCounts(companyId);

        if (!company) {
            throw { status: 404, message: "Company not found" };
        }

        const applicationCount = await companyRepository.countApplications(companyId);

        return { ...company, applicationCount };
    }

    public async updateCompany(companyId: number, data: UpdateCompanyInput) {
        const company = await companyRepository.findById(companyId);

        if (!company) {
            throw { status: 404, message: "Company not found" };
        }

        // email and phone are unique columns, so check before saving
        if (data.email && data.email !== company.email) {
            const emailTaken = await companyRepository.findByEmail(data.email);
            if (emailTaken) {
                throw { status: 409, message: "Another company already uses this email" };
            }
        }

        if (data.phone && data.phone !== company.phone) {
            const phoneTaken = await companyRepository.findByPhone(data.phone);
            if (phoneTaken) {
                throw { status: 409, message: "Another company already uses this phone number" };
            }
        }

        return companyRepository.update(companyId, data);
    }

    public async deleteCompany(companyId: number) {
        const company = await companyRepository.findByIdWithCounts(companyId);

        if (!company) {
            throw { status: 404, message: "Company not found" };
        }

        // Count first, so the admin can be told what was removed
        const deletedJobs = company._count.jobs;
        const deletedApplications = await companyRepository.countApplications(companyId);

        await companyRepository.deleteWithRelations(companyId);

        return { deletedJobs, deletedApplications };
    }

    public async getJobs(filters:{
        search?:string;
        status?: JobStatus;
        page?:number;
        limit?:number;
    }){
        const { jobs, total } = await jobRepository.findAllForAdmin(filters);

        const page = filters.page || 1;
        const limit = filters.limit || 10;

        return { jobs, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    public async getJobById(jobId:number){
        const job = await jobRepository.findByIdWithCounts(jobId);

        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

        return job;
    
    }

    public async updateJobStatus(jobId:number, status: "Suspended" | "Open"){
        const job = await jobRepository.findById(jobId);

        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

    if(status === "Suspended" && job.status!=="Open"){
        throw{ status:400, message:"Only open jobs can be suspended"}
    }   
    
    if(status === "Open" && job.status !== "Suspended"){
        throw{ status:400, message:"Only suspended jobs can be reopened"}
    }
    return jobRepository.updateStatus(jobId, status);
}
    public async deleteJob(jobId:number){
        const job = await jobRepository.findByIdWithCounts(jobId);

        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

const deletedApplications = job._count.applications;
  const deletedSavedJobs = job._count.savedBy;

  await jobRepository.deleteWithRelations(jobId);

  return { deletedApplications, deletedSavedJobs };
    }

    public async getApplications(filters:{
        search?: string;
        status?:ApplicationStatus;
        page?:number;
        limit?:number;
    }){
        const [{applications, total},statusCounts] = await Promise.all([
            applicationRepository.findAllForAdmin(filters),
            applicationRepository.countByStatus()
        ]);
        const page = filters.page || 1;
        const limit = filters.limit || 10;

        return{applications,total,page,limit,totalPages:Math.ceil(total/limit),statusCounts};
    }
}