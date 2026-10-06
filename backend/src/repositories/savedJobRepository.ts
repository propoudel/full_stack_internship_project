import {prisma} from "../config/prisma";
import {SavedJob} from "@prisma/client";
export class SavedJobRepository{
    public async create(userId: number, jobId:number):Promise<SavedJob>{
        return prisma.savedJob.create({data:{userId, jobId}});
    }

    public async FindByUserAndJob(userId:number, jobId:number):Promise<SavedJob | null>{
        return prisma.savedJob.findUnique({
            where:{userId_jobId:{userId, jobId}},
        });
    }

    public async FindAllByUser(userId:number): Promise<SavedJob[]>{
        return prisma.savedJob.findMany({
            where:{userId},
            orderBy:{savedAt:"desc"},
            include:{job:true},
        });
    }

    public async delete(userId:number,jobId:number): Promise<void>{
        await prisma.savedJob.deleteMany({
            where:{userId,jobId}})
    }
}