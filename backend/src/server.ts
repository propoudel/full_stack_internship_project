import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from "./routes";
import authRoute from "./routes/authRoute";
import cookieParser from "cookie-parser";
import companyRoute from "./routes/companyRoute";
import jobRoute from "./routes/jobRoute";

const app: Application = express();

app.use(cors({
  origin:"http://localhost:3000", 
  credentials:true,
}));
app.use(cookieParser());
app.use(express.json());   

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Routes
app.use("/api/v1", router);
app.use("/api/v1/auth",authRoute);
app.use("/api/v1/companies",companyRoute);
app.use("/api/v1/jobs",jobRoute);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});