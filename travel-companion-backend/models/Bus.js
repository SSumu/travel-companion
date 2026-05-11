import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    roadName: {
      type: String,
      required: true,
    },
    startLocation: {
      type: String,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    operatingFrom: {
      type: String,
      required: true,
    },
    operatingTo: {
      type: String,
      required: true,
    },
    intervalMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["Running", "Faulty", "Maintenance"],
      default: "Running",
    },
    routeCoordinates: [
      {
        lat: Number,
        lng: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Bus", busSchema);
