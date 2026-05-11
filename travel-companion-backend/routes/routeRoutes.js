import express from "express";

const routeRoutes = express.Router();

routeRoutes.get("/", (req, res) => {
  res.json({ message: "Routes API" });
});

export default routeRoutes;
