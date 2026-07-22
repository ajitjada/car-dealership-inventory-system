import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";

let mongoServer: MongoMemoryServer;

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 30000);

  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  it("should register a new user successfully and return 201 status", async () => {
    const newUser = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("token");
    expect(response.body.data).toHaveProperty("email", newUser.email);
  });

  it("should return 400 if user with email already exists", async () => {
    const newUser = {
      name: "John Doe",
      email: "duplicate@example.com",
      password: "Password123!",
    };

    await request(app).post("/api/auth/register").send(newUser);

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body.message).toContain("already exists");
  });

  it("should return 400 if required fields are missing", async () => {
    const invalidUser = {
      email: "incomplete@example.com",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });
});