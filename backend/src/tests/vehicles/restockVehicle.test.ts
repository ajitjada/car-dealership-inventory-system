import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("POST /api/vehicles/:id/restock", () => {
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

  it("should allow an admin to restock an existing vehicle successfully and increase quantity by specified amount (200)", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    });

    const restockPayload = {
      quantity: 10,
    };

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(restockPayload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("quantity", 15);

    const updatedVehicle = await Vehicle.findById(vehicle._id);
    expect(updatedVehicle?.quantity).toBe(15);
  });

  it("should return 403 when a non-admin user attempts to restock a vehicle", async () => {
    const vehicle = await Vehicle.create({
      make: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 3,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("success", false);

    const checkVehicle = await Vehicle.findById(vehicle._id);
    expect(checkVehicle?.quantity).toBe(3);
  });

  it("should return 404 if the vehicle does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .post(`/api/vehicles/${nonExistentId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 if the restock quantity is zero or negative", async () => {
    const vehicle = await Vehicle.create({
      make: "Ford",
      model: "Mustang",
      category: "Coupe",
      price: 35000,
      quantity: 2,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);

    const negativeResponse = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(negativeResponse.status).toBe(400);
    expect(negativeResponse.body).toHaveProperty("success", false);

    const checkVehicle = await Vehicle.findById(vehicle._id);
    expect(checkVehicle?.quantity).toBe(2);
  });

  it("should return 401 when JWT token is missing", async () => {
    const vehicle = await Vehicle.create({
      make: "Ford",
      model: "Mustang",
      category: "Coupe",
      price: 35000,
      quantity: 2,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .send({ quantity: 5 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const vehicle = await Vehicle.create({
      make: "Ford",
      model: "Mustang",
      category: "Coupe",
      price: 35000,
      quantity: 2,
    });

    const response = await request(app)
      .post(`/api/vehicles/${vehicle._id}/restock`)
      .set("Authorization", "Bearer invalidtoken123")
      .send({ quantity: 5 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});
