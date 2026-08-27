import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from "./routes";


const app: Application = express();

app.use(cors());
app.use(express.json());   

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Routes
app.use("/api/v1", router);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});