import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import busRoutes from "./routes/busRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);

app.get("/", (req, res) => {
  res.send("Bus Tracking API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
