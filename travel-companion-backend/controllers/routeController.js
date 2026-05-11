import Bus from "../models/Bus.js";
import Route from "../models/Route.js";

// CREATE ROUTE
export const createRoute = async (req, res) => {
  try {
    const { roadName, buses } = req.body;

    const route = await Route.create({
      roadName,
      buses,
    });

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL ROUTES
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate("buses");

    res.json(routes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE ROUTE
export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate("buses");

    if (!route) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE ROUTE
export const updateRoute = async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    ).populate("buses");

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(updatedRoute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ROUTE
export const deleteRoute = async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);

    if (!deletedRoute) {
      return res.status(404).json({
        message: "Route not found",
      });
    }

    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD BUS TO ROUTE
export const addBusToRoute = async (req, res) => {
  try {
    const { routeId, busId } = req.params;

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (!route.buses.includes(busId)) {
      route.buses.push(busId);
      await route.save();
    }

    const updatedRoute = await Route.findById(routeId).populate("buses");

    res.json(updatedRoute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE BUS FROM ROUTE
export const removeBusFromRoute = async (req, res) => {
  try {
    const { routeId, busId } = req.params;

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    route.buses = route.buses.filter((bus) => bus.toString() !== busId);

    await route.save();

    const updatedRoute = await Route.findById(routeId).populate("buses");

    res.json(updatedRoute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ROUTES BY ROAD NAME
export const getRoutesByRoadName = async (req, res) => {
  try {
    const routes = await Route.find({
      roadName: { $regex: req.params.roadName, $options: "i" },
    }).populate("buses");

    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
