import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  roadName: {
    type: String,
    required: true,
  },
  buses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
    },
  ],
});

export default mongoose.model("Route", routeSchema);
