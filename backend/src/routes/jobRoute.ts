import { Router } from "express";
import { JobController } from "../controllers/jobController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createJobSchema, updateJobSchema } from "../validators/jobValidator";
import { applyToJobSchema } from "../validators/applicationValidator";
import { ApplicationController } from "../controllers/applicationController";

const router =  Router();
const jobController = new JobController();
const applicationController = new ApplicationController();

// public routes
router.get("/",jobController.getAllJobs);
router.get("/:id",jobController.getJobById);

// protected Routes
router.post("/", authMiddleware, validate(createJobSchema), jobController.createJob);
router.get("/me/jobs",authMiddleware,jobController.getMyJobs)
router.put("/:id",authMiddleware,validate(updateJobSchema),jobController.updateJob);
router.delete("/:id", authMiddleware,validate(updateJobSchema),jobController.deleteJob);
router.patch("/:id/publish", authMiddleware, jobController.publishJob);
router.patch("/:id/deactivate", authMiddleware, jobController.deactivateJob);
router.post("/:jobId/applications",authMiddleware,validate(applyToJobSchema),applicationController.applyToJob);
router.get("/:jobId/applications",authMiddleware,applicationController.getApplicationsForJob);
export default router;
