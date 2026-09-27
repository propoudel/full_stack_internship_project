import { JobRepository } from "../repositories/jobRepository";
import { CompanyRepository } from "../repositories/companyRepository";
import { Job, JobStatus } from "@prisma/client";
import { CreateJobInput, UpdateJobInput } from "../validators/jobValidator";

const jobRepository = new JobRepository();
const companyRepository = new CompanyRepository();

export class JobService {
    public async createJob(userId: number, data: CreateJobInput): Promise<Job> {
        const company = await companyRepository.findByOwnerID(userId)

        if (!company) {
            throw {
                status: 400,
                message: "You must create a company before posting a job",
            };
        }

        return jobRepository.create({
            ...data,
            companyId: company.id
        });
    }

    // get all job
    public async getAllJobs(filters: {
        search?: string;
        location?: string;
        employmentType?: string;
        experienceLevel?: string;
        sortBy?: string;
        order?: "asc" | "desc";
        page?: number;
        limit?: number;
    }): Promise<{ jobs: Job[]; total: number; page: number; limit: number; totalPages: number }> {

        const { jobs, total } = await jobRepository.findAllOpen(filters);

        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const totalPages = Math.ceil(total / limit);

        return { jobs, total, page, limit, totalPages };
    }

    public async getJobById(id: number): Promise<Job> {
        const job = await jobRepository.findById(id);
        if (!job) {
            throw { status: 400, message: "Job not found" };
        }
        return job;
    }

    public async getMyJobs(userId: number): Promise<Job[]> {
        const company = await companyRepository.findByOwnerID(userId);

        if (!company) {
            throw {
                status: 400,
                message: "You have not created a company yet"
            }
        }
        return jobRepository.findByCompanyId(company.id);
    }

    public async updateJob(userId: number, jobId: number, data: UpdateJobInput): Promise<Job> {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw {
                status: 404,
                message: "No job found",
            }
        }
        const company = await companyRepository.findByOwnerID(userId);
        if (!company || company.id !== job.companyId) {
            throw {
                status: 403,
                message: "You dont have permission to update this job"
            };
        }
        return jobRepository.update(jobId, data)
    }

    public async deleteJob(userId: number, jobId: number): Promise<Job> {
        const job = await jobRepository.findById(jobId);

        if (!job) {
            throw {
                status: 404,
                message: "Job not found"
            };
        }
        const company = await companyRepository.findByOwnerID(userId);
        if (!company) {
            throw {
                status: 403,
                message: "You are not allowed to delete this job"
            }
        }
        return jobRepository.delete(jobId);
    }

    // to deactive the job 
    public async deactivateJob(userId: number, jobId: number): Promise<Job> {
        const job = await jobRepository.findById(jobId);

        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

        const company = await companyRepository.findByOwnerID(userId);
        if (!company || company.id !== job.companyId) {
            throw { status: 403, message: "You do not have permission to deactivate this job" };
        }

        if (job.status !== "Open") {
            throw { status: 400, message: "Only open jobs can be deactivated" };
        }

        return jobRepository.update(jobId, { status: "Closed" });
    }

    // to publish draft job
    public async publishJob(userId: number, jobId: number): Promise<Job> {
        const job = await jobRepository.findById(jobId);

        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

        const company = await companyRepository.findByOwnerID(userId);
        if (!company || company.id !== job.companyId) {
            throw { status: 403, message: "You do not have permission to publish this job" };
        }

        if (job.status !== "Draft") {
            throw { status: 400, message: "Only draft jobs can be published" };
        }

        return jobRepository.update(jobId, { status: "Open" });
    }

}