import API from "./api.js";

// Get all buses
export const getAllBuses = async () => {
  try {
    const res = await API.get("/buses");
    return res.data;
  } catch (error) {
    console.error("Error fetching buses:", error);
    throw error;
  }
};

// Create a new bus
export const createBus = async (data) => {
  try {
    const res = await API.post("/buses", data);
    return res.data;
  } catch (error) {
    console.error("Error creating bus:", error);
    throw error;
  }
};

// Get bus by ID
export const getBusById = async (id) => {
  try {
    const res = await API.get(`/buses/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching bus:", error);
    throw error;
  }
};

// Update bus
export const updateBus = async (id, data) => {
  try {
    const res = await API.put(`/buses/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating bus:", error);
    throw error;
  }
};

// Delete bus
export const deleteBus = async (id) => {
  try {
    const res = await API.delete(`/buses/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting bus:", error);
    throw error;
  }
};

// Update bus running status
export const updateBusStatus = async (id, status) => {
  try {
    const res = await API.patch(`/buses/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error("Error updating bus status:", error);
    throw error;
  }
};
