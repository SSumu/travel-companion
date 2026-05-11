import Bus from "../models/Bus.js";

export const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBus = async (req, res) => {
  try {
    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedBus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      message: "Bus deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBusesByRoad = async (req, res) => {
  try {
    const buses = await Bus.find({
      roadName: req.params.road,
    });

    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
