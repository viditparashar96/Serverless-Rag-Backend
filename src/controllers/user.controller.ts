import { Context } from "hono";
import { getPrisma } from "../configs/db-config";

import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";

export const createUser = async (c: Context) => {
  try {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) {
      return c.json({
        msg: "Please fill all fields",
      });
    }
    const prisma = getPrisma(c.env.DATABASE_URL);
    const userfound = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (userfound) {
      return c.json("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });
    return c.json({
      msg: "User created",
      user: createdUser,
    });
  } catch (error) {
    console.log(error);
    return c.json({
      msg: "Something went wrong",
    });
  }
};

export const loginUser = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({
        msg: "Please fill all fields",
      });
    }
    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return c.json({
        msg: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({
        msg: "Invalid credentials",
      });
    }
    const payload = {
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3,
    };
    const token = await sign(payload, c.env.JWT_SECRET_KEY!);
    return c.json({
      msg: "User logged in",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return c.json({
      msg: "Something went wrong",
    });
  }
};

export const currentUser = async (c: any) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await prisma.user.findUnique({
      where: {
        id: c.req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return c.json({
      msg: "User found",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return c.json({
      msg: "Something went wrong",
    });
  }
};
