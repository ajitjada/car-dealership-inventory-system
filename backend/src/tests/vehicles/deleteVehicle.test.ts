import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("DELETE /api/vehicles/:id", () => {
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const adminPayload = {
      id: new mongoose.Types.ObjectId().toString(),
      email: "admin@example.com",
      role: "admin",
    };
    adminToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: "1h" });

    const customerPayload = {
      id: new mongoose.Types.ObjectId().toString(),
      email: "customer@example.com",
      role: "customer",
    };
    customerToken = jwt.sign(customerPayload, JWT_SECRET, { expiresIn: "1h" });
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  it("should allow an admin to delete an existing vehicle and return 200", async () => {
    const vehicle = await Vehicle.create({
      make: "BMW",
      model: "M3",
      category: "Coupe",
      price: 70000,
      quantity: 1,
    });

    const response = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);

    const deletedVehicle = await Vehicle.findById(vehicle._id);
    expect(deletedVehicle).toBeNull();
  });

  it("should return 403 when a non-admin user attempts to delete a vehicle", async () => {
    const vehicle = await Vehicle.create({
      make: "Audi",
      model: "A4",
      category: "Sedan",
      price: 40000,
      quantity: 3,
    });

    const response = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("success", false);

    const existingVehicle = await Vehicle.findById(vehicle._id);
    expect(existingVehicle).not.toBeNull();
  });

  it("should return 404 when deleting a vehicle ID that does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/vehicles/${nonExistentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is missing", async () => {
    const vehicle = await Vehicle.create({
      make: "Mercedes",
      model: "C-Class",
      category: "Sedan",
      price: 45000,
      quantity: 2,
    });

    const response = await request(app).delete(`/api/vehicles/${vehicle._id}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const vehicle = await Vehicle.create({
      make: "Mercedes",
      model: "C-Class",
      category: "Sedan",
      price: 45000,
      quantity: 2,
    });

    const response = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", "Bearer invalidtoken123");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});
