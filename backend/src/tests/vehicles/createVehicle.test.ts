import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("POST /api/vehicles", () => {
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
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  it("should add a vehicle successfully when authenticated and payload is valid (201)", async () => {
    const newVehicle = {
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    };

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newVehicle);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("make", newVehicle.make);
    expect(response.body.data).toHaveProperty("model", newVehicle.model);
    expect(response.body.data).toHaveProperty("price", newVehicle.price);
    expect(response.body.data).toHaveProperty("quantity", newVehicle.quantity);
  });

  it("should return 401 when missing JWT token", async () => {
    const newVehicle = {
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 5,
    };

    const response = await request(app)
      .post("/api/vehicles")
      .send(newVehicle);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 when required fields are missing", async () => {
    const invalidVehicle = {
      make: "Toyota",
    };

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidVehicle);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 when price is invalid (negative or zero)", async () => {
    const invalidVehicle = {
      make: "Toyota",
      model: "Corolla",
      category: "Sedan",
      price: -500,
      quantity: 5,
    };

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidVehicle);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 when quantity is invalid (negative)", async () => {
    const invalidVehicle = {
      make: "Toyota",
      model: "RAV4",
      category: "SUV",
      price: 30000,
      quantity: -1,
    };

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidVehicle);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 409 when adding a duplicate vehicle (same make and model)", async () => {
    const vehicleData = {
      make: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 22000,
      quantity: 10,
    };

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send(vehicleData);

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send(vehicleData);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("success", false);
  });
});
