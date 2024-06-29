import { Hono } from "hono";
import {
  chatWithProject,
  createProject,
  getChatHistoryByTableId,
  getProjects,
} from "../controllers/project.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { Bindings } from "../types";

export const project_route = new Hono<{ Bindings: Bindings }>();

project_route.post(
  "/create",
  authenticateUser,

  createProject
);
project_route.get("/getprojects", authenticateUser, getProjects);
project_route.post("/chat/:table_id", authenticateUser, chatWithProject);
project_route.get(
  "/getchats/:table_id",
  authenticateUser,
  getChatHistoryByTableId
);
