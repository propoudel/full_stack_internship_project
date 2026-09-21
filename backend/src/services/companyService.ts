import { CompanyRepository } from "../repositories/companyRepository";
import { Company } from "@prisma/client";
import {CreateCompanyInput, UpdateCompanyInput} from "../validators/companyValidator";

const companyRepository = new CompanyRepository();

export class CompanyService{
    public async createCompany(ownerId:number, data:CreateCompanyInput): Promise<Company>{
        const existingCompany = await companyRepository.findByOwnerID(ownerId);
        if(existingCompany){
            throw {status:409, message:"User already has a company"};
        }
        return companyRepository.create({...data, ownerId});
    }

    //get the logged in user's company
    public async getMyCompany(ownerId:number): Promise<Company>{
        const company = await companyRepository.findByOwnerID(ownerId);
        if(!company){
            throw {status:404, message:"Company not found"};
        }
        return company;
    }

    // get all companies
    public async getAllCompanies(): Promise<Company[]>{
        return companyRepository.findAll();
    }

    //get single company by id
    public async getCompanyById(id:number): Promise<Company>{
        const company = await  companyRepository.findById(id);

        if(!company){
            throw {status:404, message:"Company not found with this id"};
        }
        return company;
    }

    // update - only owner of the company can update it
    public async updateCompany(
        ownerId:number,
        companyId:number,
        data:UpdateCompanyInput
    ): Promise<Company>{
        const company = await companyRepository.findById(companyId);
        if(!company){
            throw {status:404, message:"Company not found"};
        }
        if(company.ownerId !== ownerId){
            throw {status:403, message:"You are not authorized to update this company"};
        }
        return companyRepository.update(companyId, data);
    }

    // delete - only owner of the company can delete it
    public async deleteCompany(ownerid:number,companyId:number): Promise<Company>{
        const company = await companyRepository.findById(companyId);

        if(!company){
            throw {status:404, message:"Company not found"};
        }
        if(company.ownerId !== ownerid){
            throw {status:403, message:"You are not authorized to delete this company"};
        }
        return companyRepository.delete(companyId);
    }
}