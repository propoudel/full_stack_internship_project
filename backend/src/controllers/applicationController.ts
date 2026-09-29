import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ApplicationService } from "../services/applicationService";
import { success } from "zod";

const applicationService = new ApplicationService();

export class ApplicationController{

    //POST /jobs/:jobId/applications

    applyToJob= async (req:AuthRequest, res:Response):Promise<Response>=>{
        try{
            const applicantId = req.user!.id;
            const jobId= Number(req.params.jobId);

            const application = await applicationService.applyToJob(applicantId,jobId,req.body);

            return res.status(201).json({
                success:true,
                message:"Application submitted sucessfully",
                data:application
            });
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({sucess:false, message});
        }
    };

    //Get /applications/me
    
    getMyApplications = async(req:AuthRequest, res:Response):Promise<Response>=>{
        try{
            const applicantId = req.user!.id;
            const applications = await applicationService.getMyApplications(applicantId);

            return res.status(200).json({sucess:true, data:applications});
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({sucess:false, message});
        }
    };

    //GET /jobs/:jobId/applications

    getApplicationsForJob = async (req:AuthRequest, res:Response):Promise<Response>=>{
        try{
            const userId = req.user!.id;
            const jobId = Number(req.params.jobId);

            const applications = await applicationService.getApplicationsForJob(userId,jobId);

            return res.status(200).json({sucess:true, data:applications});
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ sucess:false, message});
        }
    };

    //Get /applications/:id
    getApplicationById = async (req:AuthRequest, res:Response): Promise<Response>=>{
       try{ const userId = req.user!.id;
        const applicationId = Number(req.params.id);

        const application = await applicationService.getApplicationById(userId,applicationId);

        return res.status(200).json({sucess:true, data:application});
    }catch(error:any){
        const status = error.status || 500;
        const message = error.message || "Something went wrong";
        return res.status(status).json({sucess:false, message});
    }
    };

    // PATCH /applications/:id/status
    updateStatus = async (req:AuthRequest, res:Response):Promise<Response>=>{
       try{
        const userId = req.user!.id;
        const applicationId = Number(req.params.id);
        const{status} = req.body;

        const application = await applicationService.updateStatus(userId,applicationId,status);

        return res.status(200).json({sucess:true, message:"Application status updated sucessfully",data:application,})
    }catch(error:any){
        const status= error.status || 500;
        const message = error.message || "something went wrong";
        return res.status(status).json({sucess:false, message});
    }
};
}