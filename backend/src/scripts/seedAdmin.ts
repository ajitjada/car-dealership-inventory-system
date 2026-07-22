import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";

dotenv.config();

export const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log(`Admin account (${adminEmail}) already exists. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Admin@123", saltRounds);

    const adminUser = await User.create({
      name: "Default Admin",
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Default admin created successfully with ID: ${adminUser._id}`);
    await mongoose.disconnect();
  } catch (error: any) {
    console.error("Error seeding admin user:", error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  seedAdmin().then(() => {
    process.exit(0);
  });
}
