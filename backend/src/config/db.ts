import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI || "mongodb://localhost:27017/car-dealership";
    await mongoose.connect(connStr);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
