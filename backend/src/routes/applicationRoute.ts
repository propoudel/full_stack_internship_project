import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { applyToJobSchema, updateApplicationStatusSchema } from "../validators/applicationValidator";

const router = Router();
const applicationController = new ApplicationController();

router.get("/me",authMiddleware,applicationController.getMyApplications);
router.get("/:id",authMiddleware,applicationController.getApplicationById);
router.patch("/:id/status",authMiddleware,validate(updateApplicationStatusSchema),applicationController.updateStatus);


export default router;