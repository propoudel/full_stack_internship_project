import {Router} from "express";
import { CompanyController } from "../controllers/companyController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createCompanySchema, updateCompanySchema } from "../validators/companyValidator";

const router = Router(); 
const companyController = new CompanyController();

// Public routes
router.get("/",companyController.getAllCompanies);
router.get("/:id",companyController.getCompanyById);

// protected routes
router.post("/",authMiddleware,validate(createCompanySchema),companyController.createCompany);
router.get("/me/company",authMiddleware,companyController.getMyCompany);
router.put("/:id",authMiddleware,validate(updateCompanySchema),companyController.updateCompany);
router.delete("/:id",authMiddleware,companyController.deleteCompany);

export default router;