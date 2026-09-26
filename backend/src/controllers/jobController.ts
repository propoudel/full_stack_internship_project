import { Response } from "express";
import { JobService } from "../services/jobService";
import { AuthRequest } from "../middlewares/authMiddleware";

const jobService = new JobService();

export class JobController {
    createJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const job = await jobService.createJob(userId, req.body);

            return res.status(201).json({
                sucess: true,
                message: "Job posted sucessfully",
                data: job,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ sucess: false, message });
        }
    };

    // Get jobs
    getAllJobs = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const jobs = await jobService.getAllJobs();
            return res.status(200).json({ sucess: true, data: jobs });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ sucess: false, message });
        }
    };

    //Get jobs by id
    getJobById = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const id = Number(req.params.id);
            const job = await jobService.getJobById(id);

            return res.status(200).json({ status: true, data: job });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ sucess: false, message });
        }
    }
    //Get jobs of me

    getMyJobs = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const jobs = await jobService.getMyJobs(userId);
            return res.status(200).json({ sucess: true, data: jobs });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ sucess: false, message });
        }
    };

    // update the job
    updateJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userid = req.user!.id;
            const jobId = Number(req.params!.id);

            const job = await jobService.updateJob(userid, jobId, req.body);

            return res.status(200).json({
                sucess: true,
                message: "Job updated sucessfully",
                data: job
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";

            return res.status(status).json({ sucess: false, message });
        }
    };

    //Delete a job
    deleteJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userid = req.user!.id;
            const jobId = Number(req.params!.id);

            await jobService.deleteJob(userid, jobId);

            return res.status(200).json({ sucess: true, message: "Job deleted sucessfully" })
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";

            return res.status(status).json({ sucess: false, message });
        }
    };

    publishJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const jobId = Number(req.params.id);

            const job = await jobService.publishJob(userId, jobId);

            return res.status(200).json({ sucess: true, data: job, message: "Job published Sucessfully" });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Somethingwent wrong";
            return res.status(status).json({ sucess: false, message });
        }
    };

    deactivateJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const jobId = Number(req.params.id);

            const job = await jobService.deactivateJob(userId, jobId);

            return res.status(200).json({
                success: true,
                message: "Job deactivated successfully",
                data: job,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };
}