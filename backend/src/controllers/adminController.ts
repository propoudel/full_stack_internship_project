import { Response } from "express";
import { AdminService } from "../services/adminService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
const adminService = new AdminService();
import { JobStatus, ApplicationStatus } from "@prisma/client";
export class AdminController {
    getStats = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const stats = await adminService.getPlatformStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // GET /admin/users
    getUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { search, role, isActive, page, limit } = req.query;

            const result = await adminService.getUsers({
                search: search as string,
                role: role as Role,
                isActive: isActive === undefined ? undefined : isActive === "true",
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });

            return res.status(200).json({
                success: true,
                data: result.users,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // GET /admin/users/:id
    getUserById = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const user = await adminService.getUserById(Number(req.params.id));
            return res.status(200).json({ success: true, data: user });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // PATCH /admin/users/:id/role
    updateUserRole = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const adminId = req.user!.id;
            const userId = Number(req.params.id);

            const user = await adminService.updateUserRole(adminId, userId, req.body.role);

            return res.status(200).json({
                success: true,
                message: "User role updated successfully",
                data: user,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // PATCH /admin/users/:id/status
    updateUserStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const adminId = req.user!.id;
            const userId = Number(req.params.id);

            const user = await adminService.updateUserStatus(adminId, userId, req.body.isActive);

            return res.status(200).json({
                success: true,
                message: req.body.isActive ? "User activated successfully" : "User deactivated successfully",
                data: user,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };
    // GET /admin/companies
    getCompanies = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { search, page, limit } = req.query;

            const result = await adminService.getCompanies({
                search: search as string,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });

            return res.status(200).json({
                success: true,
                data: result.companies,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // GET /admin/companies/:id
    getCompanyById = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const company = await adminService.getCompanyById(Number(req.params.id));
            return res.status(200).json({ success: true, data: company });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // PUT /admin/companies/:id
    updateCompany = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const company = await adminService.updateCompany(Number(req.params.id), req.body);

            return res.status(200).json({
                success: true,
                message: "Company updated successfully",
                data: company,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // DELETE /admin/companies/:id
    deleteCompany = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const result = await adminService.deleteCompany(Number(req.params.id));

            return res.status(200).json({
                success: true,
                message: "Company deleted successfully",
                data: result, // { deletedJobs, deletedApplications }
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // GET /admin/jobs
    getJobs = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { search, status, page, limit } = req.query;

            const validStatuses = ["Draft", "Open", "Closed", "Suspended"];
            if (status && !validStatuses.includes(status as string)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
                });
            }

            const result = await adminService.getJobs({
                search: search as string,
                status: status as JobStatus,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });

            return res.status(200).json({
                success: true,
                data: result.jobs,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // GET /admin/jobs/:id
    getJobById = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const job = await adminService.getJobById(Number(req.params.id));
            return res.status(200).json({ success: true, data: job });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // PATCH /admin/jobs/:id/status
    updateJobStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const job = await adminService.updateJobStatus(Number(req.params.id), req.body.status);

            return res.status(200).json({
                success: true,
                message: req.body.status === "Suspended" ? "Job suspended successfully" : "Job restored successfully",
                data: job,
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // DELETE /admin/jobs/:id
    deleteJob = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const result = await adminService.deleteJob(Number(req.params.id));

            return res.status(200).json({
                success: true,
                message: "Job deleted successfully",
                data: result, // { deletedApplications, deletedSavedJobs }
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };

    // for applications
    // GET /admin/applications
    getApplications = async (req: AuthRequest, res: Response): Promise<Response> => {
        try {
            const { search, status, page, limit } = req.query;

            const validStatuses = ["Pending", "Reviewed", "Accepted", "Rejected"];
            if (status && !validStatuses.includes(status as string)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
                });
            }

            const result = await adminService.getApplications({
                search: search as string,
                status: status as ApplicationStatus,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });

            return res.status(200).json({
                success: true,
                data: result.applications,
                statusCounts: result.statusCounts,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error: any) {
            const status = error.status || 500;
            const message = error.message || "Something went wrong";
            return res.status(status).json({ success: false, message });
        }
    };
}