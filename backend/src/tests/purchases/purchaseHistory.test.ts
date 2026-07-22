import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import { Vehicle } from "../../models/Vehicle";
import { User } from "../../models/User";
import { Purchase } from "../../models/Purchase";

let mongoServer: MongoMemoryServer;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey";

describe("Purchase History APIs", () => {
  let customerToken: string;
  let adminToken: string;
  let customerId: string;
  let adminId: string;
  let vehicleId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    customerId = new mongoose.Types.ObjectId().toString();
    adminId = new mongoose.Types.ObjectId().toString();

    await User.create([
      {
        _id: customerId,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        role: "customer",
      },
      {
        _id: adminId,
        name: "Admin User",
        email: "admin@example.com",
        password: "hashedpassword",
        role: "admin",
      },
    ]);

    customerToken = jwt.sign(
      { id: customerId, email: "john@example.com", role: "customer" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: adminId, email: "admin@example.com", role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    await Purchase.deleteMany({});

    const vehicle = await Vehicle.create({
      make: "Toyota",
      model: "Fortuner",
      category: "SUV",
      price: 3500000,
      quantity: 5,
    });
    vehicleId = vehicle._id.toString();
  });

  it("POST /api/vehicles/:id/purchase creates a Purchase record and decreases vehicle stock", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.quantity).toBe(4);

    const purchases = await Purchase.find({ user: customerId });
    expect(purchases).toHaveLength(1);
    expect(purchases[0].purchasePrice).toBe(3500000);
    expect(purchases[0].status).toBe("Purchased");
  });

  it("GET /api/purchases/me returns only the customer's purchase history", async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`);

    const response = await request(app)
      .get("/api/purchases/me")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty("vehicle", "Toyota Fortuner");
    expect(response.body[0]).toHaveProperty("purchasePrice", 3500000);
    expect(response.body[0]).toHaveProperty("status", "Purchased");
  });

  it("GET /api/purchases returns all purchases for admin user", async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${customerToken}`);

    const response = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty("customerName", "John Doe");
    expect(response.body[0]).toHaveProperty("customerEmail", "john@example.com");
    expect(response.body[0]).toHaveProperty("vehicleName", "Toyota Fortuner");
  });

  it("GET /api/purchases returns 403 Forbidden for non-admin user", async () => {
    const response = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(403);
  });
});
