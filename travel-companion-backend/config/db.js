import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  // If this way needs to be executed, it is necessary to give it's complete code in the server.js
  // await mongoose
  //   .connect(process.env.MONGO_URI)
  //   .then(() => {
  //     console.log("MongoDB Connected");
  //   })
  //   .catch((err) => console.log(err), process.exit(1));
};

export default connectDB;
