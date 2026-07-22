import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
