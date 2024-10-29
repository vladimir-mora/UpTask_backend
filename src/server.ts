import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import projectRoutes from "./routes/projectRoutes";
import authRoutes from "./routes/authRoutes";
import cors from "cors";
import { corsConfig } from "./config/cors";
import morgan from "morgan";

dotenv.config();
connectDB();
const app = express();
app.use(cors(corsConfig));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

export default app;
