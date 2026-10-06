import { Response } from "express";
import { SavedJobService } from "../services/savedJobService";
import { AuthRequest } from "../middlewares/authMiddleware";

const savedJobService = new SavedJobService();

export class SavedJobController {
    saveJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const jobId = Number(req.params.jobId);
            const saved = await savedJobService.saveJob(userId, jobId);

            return res.status(201).json({
                message: "Job saved Successfully",
                data: saved,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: true, message });
        }
    };

     removeSavedJob = async (req:AuthRequest, res:Response) : Promise<Response>=>{
        try{
        const userId= req.user!.id;
        const jobId = Number(req.params.jobId);

        await savedJobService.removeSavedJob(userId,jobId);

        return res.status(200).json({
            success:true,
            message:"Job removed from saved list",
        });
     }catch(error:any){
        const status = error.status || 500;
        const message = error.message || "Something went wrong";
        return res.status(status).json({success:false, message});
     }
    }

    getSavedJobs = async (req:AuthRequest, res:Response):Promise<Response>=>{
        try{
            const userId = req.user!.id;
            const savedJobs = await savedJobService.getSavedJobs(userId);

            return res.status(200).json({success:true, data:savedJobs});
        }catch(error:any){
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({success:false, message});
        }
    }
}