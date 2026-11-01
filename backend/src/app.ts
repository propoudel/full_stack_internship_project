import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import authRoute from "./routes/authRoute";
import companyRoute from "./routes/companyRoute";
import jobRoute from "./routes/jobRoute";
import applicationRoute from "./routes/applicationRoute";
import savedJobRoute from "./routes/savedJobRoutes";
import adminRoute from "./routes/adminRoute";

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", router);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/companies", companyRoute);
app.use("/api/v1/jobs", jobRoute);
app.use("/api/v1/applications", applicationRoute);
app.use("/api/v1/saved-jobs", savedJobRoute);
app.use("/api/v1/admin", adminRoute);

export default app;