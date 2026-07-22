import request from "supertest";
import app from "../../app";

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    // Setup test environment or database connections if needed
  });

  afterAll(async () => {
    // Cleanup resources after tests complete
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
});