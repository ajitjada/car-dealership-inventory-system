import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("GET /api/vehicles", () => {
  let authToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const payload = {
      id: new mongoose.Types.ObjectId().toString(),
      email: "user@example.com",
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

  it("should return an empty array with 200 status when no vehicles exist", async () => {
    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  it("should retrieve all vehicles stored in the database with 200 status", async () => {
    await Vehicle.create([
      {
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 5,
      },
      {
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 22000,
        quantity: 10,
      },
    ]);

    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(2);
  });

  it("should return vehicle objects containing all required properties (id, make, model, category, price, quantity)", async () => {
    await Vehicle.create({
      make: "Ford",
      model: "Mustang",
      category: "Coupe",
      price: 35000,
      quantity: 3,
    });

    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveLength(1);

    const vehicle = response.body.data[0];
    expect(vehicle).toHaveProperty("make", "Ford");
    expect(vehicle).toHaveProperty("model", "Mustang");
    expect(vehicle).toHaveProperty("category", "Coupe");
    expect(vehicle).toHaveProperty("price", 35000);
    expect(vehicle).toHaveProperty("quantity", 3);
    expect(vehicle._id || vehicle.id).toBeDefined();
  });

  it("should return 401 when JWT token is missing", async () => {
    const response = await request(app).get("/api/vehicles");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", "Bearer invalidtoken123");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});
