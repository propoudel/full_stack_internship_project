import {PrismaClient, Company} from "@prisma/client" ;
import {prisma} from "../config/prisma";

export class CompanyRepository{

    //Find a company by its owner's user id
    public async findByOwnerID(ownerId:number): Promise<Company | null>{
        return prisma.company.findUnique({where:{ownerId} });
    }

    // Find a company by its own id
    public async findById(id:number): Promise<Company | null>{
        return prisma.company.findUnique({where :{id}});
    }

    //Get all companies
    public async findAll(): Promise<Company[]>{
        return prisma.company.findMany({
            orderBy:{createdAt:"desc"},
        })
    }

    // Create a new company
    public async create(data:{
        name:string;
        description:string;
        logo:string;
        website:string;
        email:string;
        phone:string;
        address:string;
        ownerId:number;
        industry:string;
        companySize:string;
    }): Promise<Company>{
        return prisma.company.create({data});
    }

    // Update a company by id

    public async update(id:number, data:Partial<{
        name:string;
        description:string;
        logo:string;
        website:string;
        email:string;
        phone:string;
        address:string;
        companySize:string;
        industry:string;
    }>): Promise<Company>{
        return prisma.company.update({where:{id}, data});
    }

    // delete a company by id
    public async delete(id:number): Promise<Company>{
        return prisma.company.delete({where:{id}});
    }
}