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

  public async findAllForAdmin(filters:{
    search?: string;
    status?:ApplicationStatus;
    page?: number;
    limit?: number;
  }){
    const {search,status, page =1, limit =10} = filters;
    const where:any ={};
    if(search){
      where.OR =[
      { applicant: { name: { contains: search, mode: "insensitive" } } },
      { applicant: { email: { contains: search, mode: "insensitive" } } },
      { job: { title: { contains: search, mode: "insensitive" } } },
      { job: { company: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }
    if(status){
      where.status = status;
    }

    const [applications,total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy:{appliedAt:"desc"},
        skip:(page-1)* limit,
        take:limit,
        include:{
          applicant:{select:{id:true,name:true,email:true}},
          job:{select:{id:true,title:true,status:true,company:{select:{id:true,name:true}}}}
        }
      }),
      prisma.application.count({ where })
    ]);
    return {applications,total};
  }

  public async countByStatus(){
    const rows = await prisma.application.groupBy({
      by:["status"],
      _count:{status:true},
    });

    const counts:Record<string,number>={
      Pending:0,
      Reviewed:0,
      Accepted:0,
      Rejected:0,
    };
    rows.forEach((r)=>{
      counts[r.status] = r._count.status;
    })
    return counts;
  }
}