import { prisma } from "../config/prisma";
import { Application, ApplicationStatus } from "@prisma/client";

export class ApplicationRepository{
    public async create(data:{
        resumeUrl: string;
        Experience?:string;
        applicantId:number;
        jobId:number;
    }):Promise<Application>{
        return prisma.application.create({data});
    }
    
    // to find out the multiple application by same user
    public async findByApplicantAndJob(
        applicantId:number,
        jobId:number
    ):Promise<Application | null>{
        return prisma.application.findUnique({
            where:{
                applicantId_jobId:{applicantId,jobId},
            },
        });
    }

    public async findById(id:number):Promise<Application | null>{
        return prisma.application.findUnique({where:{id}});
    }

    public async findByApplicant(applicantId: number): Promise<Application[]> {
    return prisma.application.findMany({
      where: { applicantId },
      orderBy: { appliedAt: "desc" },
    });
  }

  public async findByJob(jobId: number): Promise<Application[]> {
    return prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: "desc" },
    });
  }
  //For the status of application and update its state
  public async updateStatus(id: number, status: ApplicationStatus): Promise<Application> {
    return prisma.application.update({ where: { id }, data: { status } });
  }
}