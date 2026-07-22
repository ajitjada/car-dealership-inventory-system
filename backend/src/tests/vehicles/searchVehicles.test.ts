import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("GET /api/vehicles/search", () => {
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

    // Seed vehicle inventory for search tests
    await Vehicle.create([
      { make: "Toyota", model: "Camry", category: "Sedan", price: 25000, quantity: 5 },
      { make: "Toyota", model: "RAV4", category: "SUV", price: 32000, quantity: 4 },
      { make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 10 },
      { make: "Ford", model: "Mustang", category: "Coupe", price: 40000, quantity: 2 },
    ]);
  });

  it("should search vehicles by make", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((v: any) => v.make === "Toyota")).toBe(true);
  });

  it("should search vehicles by model", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ model: "Civic" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty("model", "Civic");
  });

  it("should search vehicles by category", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ category: "Sedan" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((v: any) => v.category === "Sedan")).toBe(true);
  });

  it("should search vehicles using a minimum and maximum price range", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ minPrice: 24000, maxPrice: 35000 })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveLength(2);
    expect(
      response.body.data.every(
        (v: any) => v.price >= 24000 && v.price <= 35000
      )
    ).toBe(true);
  });

  it("should return matching vehicles only when multiple search criteria are combined", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota", category: "SUV" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty("model", "RAV4");
  });

  it("should return an empty array when no vehicles match search criteria", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Ferrari" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  it("should return 401 when JWT token is missing", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 401 when JWT token is invalid", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota" })
      .set("Authorization", "Bearer invalidtoken123");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});
