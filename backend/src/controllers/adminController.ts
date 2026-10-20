import { Response } from "express";
import { AdminService } from "../services/adminService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
const adminService = new AdminService();

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

}