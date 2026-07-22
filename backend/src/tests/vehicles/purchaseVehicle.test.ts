import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("POST /api/vehicles/:id/purchase", () => {
  let authToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const payload = {
      id: new mongoose.Types.ObjectId().toString(),
      email: "customer@example.com",
      role: "customer",
    };
    authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
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

  it("should successfully purchase a vehicle and decrease quantity by 1 (200)", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("quantity", 4);

    const updatedVehicle = await Vehicle.findById(vehicle._id);
    expect(updatedVehicle?.quantity).toBe(4);
  });

  it("should return 404 if the vehicle does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .post(`/api/vehicles/${nonExistentId}/purchase`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 if quantity is already 0 (out of stock)", async () => {
    const outOfStockVehicle = await Vehicle.create({
      make: "Tesla",
      model: "Model 3",
      category: "Sedan",
      price: 40000,
      quantity: 0,
    });

    const response = await request(app)
      .post(`/api/vehicles/${outOfStockVehicle._id}/purchase`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);

    const checkVehicle = await Vehicle.findById(outOfStockVehicle._id);
    expect(checkVehicle?.quantity).toBe(0);
  });

  it("should return 401 when JWT token is missing", async () => {
    const vehicle = await Vehicle.create({
      make: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 3,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const vehicle = await Vehicle.create({
      make: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 3,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set("Authorization", "Bearer invalidtoken123");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});
