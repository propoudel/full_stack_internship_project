import {Router} from "express";
import {SavedJobController} from "../controllers/savedJobController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();
const savedJobController = new SavedJobController();

router.get("/",authMiddleware,savedJobController.getSavedJobs);
export default router;