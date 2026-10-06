import { SavedJobRepository } from "../repositories/savedJobRepository";
import { JobRepository } from "../repositories/jobRepository";
import { SavedJob } from "@prisma/client";

const savedJobRepository = new SavedJobRepository();
const jobRepository = new JobRepository();

export class SavedJobService{
    public async saveJob(userId:number, jobId:number): Promise<SavedJob>{
        const job = await jobRepository.findById(jobId);
        if(!jobId){
            throw {status:404, message:"Job not found"}
        }

        const existing = await savedJobRepository.FindByUserAndJob(userId,jobId)
            if(existing){
                throw {status : 409, message:"Job already saved"};
            }
            return savedJobRepository.create(userId,jobId);
    }

    public async getSavedJobs(userId:number): Promise<SavedJob[]>{
        return savedJobRepository.FindAllByUser(userId);
    }

    public async removeSavedJob(userId:number, jobId:number): Promise<void>{
        const existing = await savedJobRepository.FindByUserAndJob(userId,jobId);
        if(!existing){
            throw{status: 404, message:"Saved job not found"};
        }
        await savedJobRepository.delete(userId,jobId);
    }
}