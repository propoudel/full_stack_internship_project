import { ApplicationRepository } from "../repositories/applicationRepository";
import { JobRepository } from "../repositories/jobRepository";
import { CompanyRepository } from "../repositories/companyRepository";
import { ApplyToJobInput, UpdateApplicationStatusInput } from "../validators/applicationValidator"
import { ApplicationStatus, Application } from "@prisma/client";

const applicationRepository = new ApplicationRepository();
const jobRepository = new JobRepository();
const companyRepository = new CompanyRepository();

export class ApplicationService {
    public async applyToJob(applicantId: number, jobId: number, data: ApplyToJobInput): Promise<Application> {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw { status: 402, message: "Job not found" };
        };

        if (job.status !== "Open") {
            throw { status: 400, message: "Job is not open to apply" };
        };

        // self apply block (block applying to a job posted by your own company)
        const ownCompany = await companyRepository.findByOwnerId(applicantId);
        if(ownCompany && ownCompany.id == job.companyId){
            throw{status:400, message:"You cannot apply to your own company's job"};
        }

        const existing = await applicationRepository.findByApplicantAndJob(applicantId, jobId);
        if (existing) {
            throw { status: 409, message: "You have already applied to this job" }
        }

        return applicationRepository.create({
            resumeUrl: data.resumeUrl,
            experience: data.experience,
            applicantId,
            jobId,
        });
    }

    // application submittd by the logged in user
    public async getMyApplications(applicantId: number): Promise<Application[]> {
        return applicationRepository.findByApplicant(applicantId)
    }

    //Get all application for a specific job(only job owner can see)
    public async getApplicationsForJob(userId: number, jobId: number): Promise<Application[]> {
        const job = await jobRepository.findById(jobId);
        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

        const company = await companyRepository.findByOwnerId(userId);
        if (!company || company.id !== job.companyId) {
            throw { status: 403, message: "You do not have permission to view these applications" };
        }
        return applicationRepository.findByJob(jobId)
    }

    // user who applied, company owner, user who posted job can view applications applied for job
    public async getApplicationById(userId: number, applicantId: number): Promise<Application> {

        const application = await applicationRepository.findById(applicantId);
        if (!application) {
            throw { status: 404, message: "Application not found" };
        }

        if (application.applicantId === userId) {
            return application;
        }

        const job = await jobRepository.findById(application.jobId);
        const company = await companyRepository.findByOwnerId(userId);

        if (job && company && company.id == job.companyId) {
            return application;
        }
        throw { status: 403, message: "You don't have permission to view this application" }
    }

    //Update application status(job owning employeer can do)
    public async updateStatus(
        userId: number,
        applicationId: number,
        status: ApplicationStatus
    ): Promise<Application> {
        const application = await applicationRepository.findById(applicationId);
        if (!application) {
            throw { status: 404, message: "Application not found" };
        }

        const job = await jobRepository.findById(application.jobId);
        if (!job) {
            throw { status: 404, message: "Job not found" };
        }

        const company = await companyRepository.findByOwnerId(userId);
        if (!company || company.id !== job.companyId) {
            throw { status: 403, message: "You do not have permission to update this application" };
        }

        return applicationRepository.updateStatus(applicationId, status);
    }
}