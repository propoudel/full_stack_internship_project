import express from "express";
import userRoutes from "./userRoute";
import bodyParser from "body-parser";

const router = express.Router();

router.use(bodyParser.urlencoded({extended:true}));

router.use(bodyParser.json());

router.use('/user',userRoutes);

export default router

