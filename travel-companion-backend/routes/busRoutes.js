import express from "express";
import {
  createBus,
  deleteBus,
  getAllBuses,
  getBusById,
  getBusesByRoad,
  updateBus,
} from "../controllers/busController.js";

const busRoutes = express.Router();

busRoutes.post("/", createBus);
busRoutes.get("/", getAllBuses);
busRoutes.get("/:id", getBusById);
busRoutes.put("/:id", updateBus);
busRoutes.delete("/:id", deleteBus);
busRoutes.get("/road/:road", getBusesByRoad);

export default busRoutes;
