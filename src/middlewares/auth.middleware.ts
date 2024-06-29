import { verify } from "hono/jwt";

export const authenticateUser = async (c: any, next: any) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) {
      return c.json({
        msg: "Access Denied",
      });
    }
    const decoded = await verify(token, c.env.JWT_SECRET_KEY);

    c.req.user = decoded;
    await next();
  } catch (error) {
    console.log(error);
    return c.json({
      msg: "Something went wrong",
    });
  }
};
