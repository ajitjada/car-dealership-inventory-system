import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";

let mongoServer: MongoMemoryServer;

describe("POST /api/auth/login", () => {
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

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }

      // Register a registered user to test login scenarios
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "user@example.com",
        password: "Password123!",
      });
    }
  });

  it("should login successfully with valid email and password", async () => {
    const credentials = {
      email: "user@example.com",
      password: "Password123!",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("token");
    expect(response.body.data).toHaveProperty("email", credentials.email);
  });

  it("should return 401 when logging in with an invalid password", async () => {
    const credentials = {
      email: "user@example.com",
      password: "WrongPassword!",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 404 when user is not found", async () => {
    const credentials = {
      email: "nonexistent@example.com",
      password: "Password123!",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 when email is missing", async () => {
    const credentials = {
      password: "Password123!",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  it("should return 400 when password is missing", async () => {
    const credentials = {
      email: "user@example.com",
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });
});
