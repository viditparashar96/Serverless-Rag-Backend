import { Hono } from "hono";
import {
  createUser,
  currentUser,
  loginUser,
} from "../controllers/user.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { Bindings } from "../types";

export const user_route = new Hono<{ Bindings: Bindings }>();
user_route.post("/register", createUser);
user_route.post("/login", loginUser);
user_route.get("/currentUser", authenticateUser, currentUser);
