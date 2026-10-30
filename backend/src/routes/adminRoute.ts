import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { updateUserRoleSchema, updateUserStatusSchema,updateJobStatusSchema } from "../validators/adminValidator";
import { updateCompanySchema } from "../validators/companyValidator";

const router = Router();
const adminController = new AdminController();

// Every route in this file is Admin-only
router.use(authMiddleware, authorizeRoles("Admin"));

router.get("/stats", adminController.getStats);

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);
router.patch("/users/:id/status", validate(updateUserStatusSchema), adminController.updateUserStatus);
router.get("/companies", adminController.getCompanies);
router.get("/companies/:id", adminController.getCompanyById);
router.put("/companies/:id", validate(updateCompanySchema), adminController.updateCompany);
router.delete("/companies/:id", adminController.deleteCompany);
router.get("/jobs", adminController.getJobs);
router.get("/jobs/:id", adminController.getJobById);
router.patch("/jobs/:id/status", validate(updateJobStatusSchema), adminController.updateJobStatus);
router.delete("/jobs/:id", adminController.deleteJob);
router.get("/applications", adminController.getApplications);

export default router;