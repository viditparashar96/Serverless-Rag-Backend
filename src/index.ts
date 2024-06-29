import { Hono } from "hono";
import { logger } from "hono/logger";
import { getPrisma } from "./configs/db-config";
import { project_route } from "./routes/project.route";
import { user_route } from "./routes/user.route";
import { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.use(logger());
app.route("/api/v1/user", user_route);
app.route("/api/v1/project", project_route);
app.get("/", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const allUsers = await prisma.user.findMany();
  return c.json({
    msg: "All user fected",
    users: allUsers,
  });
});

export default app;
