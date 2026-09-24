import { Response } from "express";
import { CompanyService } from "../services/companyService";
import { AuthRequest } from "../middlewares/authMiddleware";

const companyService = new CompanyService();

export class CompanyController {

    // post companies
    createCompany = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const ownerId = req.user!.id;
            const ownerRole = req.user!.role;
            const ownerEmail = req.user!.email;

            const {company, warning} = await companyService.createCompany(
                ownerId,
                ownerRole,
                ownerEmail,
                req.body);

            return res.status(201).json({
                success: true,
                message: "Company created successfully",
                warning,
                data: company
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong while creating company";
            return res.status(status).json({ success: false, message });
        }
    };

    // get my companies
    getMyCompany = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const ownerId = req.user!.id;
            const company = await companyService.getMyCompany(ownerId);
            return res.status(200).json({
                success: true,
                message: "Company fetched successfully",
                data: company
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong while fetching company";
            return res.status(status).json({ success: false, message });
        }
    };

    // get all companies
    getAllCompanies = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const companies = await companyService.getAllCompanies();
            return res.status(200).json({
                success: true,
                message: "Companies fetched successfully",
                data: companies
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong while fetching companies";
            return res.status(status).json({ success: false, message });
        }
    };

    // get company by id
    getCompanyById = async (req:AuthRequest, res:Response): Promise<Response>=>{
        try{
        const id = Number(req.params.id);
        const company= await companyService.getCompanyById(id);
        return res.status(200).json({
            sucess:true,
            message:"Company fetched successfully",
            data:company
        });
    }catch(error:any){
        const status = error.status || 500;
        const message = error.message || "Something went wrong while fetching company";
        return res.status(status).json({ sucess:false, message});
    }
};

    // put /update company by id
    updateCompany = async (req:AuthRequest, res:Response): Promise<Response>=>{
        try{
            const ownerId = req.user!.id;
            const companyId= Number(req.params.id);
            const company = await companyService.updateCompany(ownerId, companyId,req.body);
            
            return res.status(200).json({
                sucess:true,
                message:"Company updated sucessfully",
                data:company,
            })
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong while updating";
            return res.status(status).json({sucess:false,message});
        }
    }

    // delete company by id

    deleteCompany = async (req:AuthRequest, res:Response): Promise<Response>=>{
        try{
            const ownerId = req.user!.id;
            const companyId = Number(req.params.id);

            await companyService.deleteCompany(ownerId, companyId);

            return res.status(200).json({
                sucess:true,
                message:"Company deleted sucessfully",
            });
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something wnet wrong";

            return res.status(status).json({sucess:true, message});
            }
        };
    }
    
