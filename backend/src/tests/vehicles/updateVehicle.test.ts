import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("PUT /api/vehicles/:id", () => {
  let authToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const payload = {
      id: new mongoose.Types.ObjectId().toString(),
      email: "dealer@example.com",
      role: "dealer",
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

  it("should successfully update an existing vehicle and return 200", async () => {
    const vehicle = await Vehicle.create({
      make: "Honda",
      model: "Accord",
      category: "Sedan",
      price: 28000,
      quantity: 4,
    });

    const updateData = {
      price: 29500,
      quantity: 8,
    };

    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("price", 29500);
    expect(response.body.data).toHaveProperty("quantity", 8);

    const updatedVehicle = await Vehicle.findById(vehicle._id);
    expect(updatedVehicle?.price).toBe(29500);
    expect(updatedVehicle?.quantity).toBe(8);
  });

  it("should return 404 when the vehicle ID does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/vehicles/${nonExistentId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ price: 30000 });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 for invalid price (negative or zero)", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Highlander",
      category: "SUV",
      price: 35000,
      quantity: 3,
    });

    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ price: -100 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 for invalid quantity (negative)", async () => {
    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Corolla",
      category: "Sedan",
      price: 20000,
      quantity: 5,
    });

    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ quantity: -5 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 for invalid request body (empty body)", async () => {
    const vehicle = await Vehicle.create({
      make: "Ford",
      model: "F-150",
      category: "Truck",
      price: 45000,
      quantity: 2,
    });

    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is missing", async () => {
    const vehicle = await Vehicle.create({
      make: "Nissan",
      model: "Altima",
      category: "Sedan",
      price: 24000,
      quantity: 6,
    });

    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .send({ price: 25000 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const vehicle = await Vehicle.create({
      make: "Nissan",
      model: "Altima",
      category: "Sedan",
      price: 24000,
      quantity: 6,
    });

    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set("Authorization", "Bearer invalidtoken123")
      .send({ price: 25000 });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});
