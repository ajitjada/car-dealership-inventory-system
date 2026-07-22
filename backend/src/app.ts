import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import purchaseRoutes from "./routes/purchase.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/purchases", purchaseRoutes);

export default app;
