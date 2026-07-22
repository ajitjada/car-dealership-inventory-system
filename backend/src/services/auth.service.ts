import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export class AuthService {
  async register(data: RegisterUserData): Promise<AuthResult> {
    const { name, email, password, role } = data;

    if (!name || !email || !password) {
      const error: any = new Error("Name, email, and password are required");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error: any = new Error("User with this email already exists");
      error.statusCode = 400;
      throw error;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "customer",
    });

    const jwtSecret = process.env.JWT_SECRET || "defaultsecretkey";
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
      token,
    };
  }

  async login(data: LoginUserData): Promise<AuthResult> {
    const { email, password } = data;

    if (!email || !password) {
      const error: any = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      const error: any = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    const jwtSecret = process.env.JWT_SECRET || "defaultsecretkey";
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "1d" }
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "customer",
      },
      token,
    };
  }
}
