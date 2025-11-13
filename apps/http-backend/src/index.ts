import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { JWT_SECRET } from "@repo/backend-common/config";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();
const PORT = 3001;

app.use(express.json());

// Get zod validation implemented
app.post("/signup", async (req: Request, res: Response) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.json({ message: "Incorrect Inputs" });
  }

  const { name, username, password } = result.data;

  const user = await prismaClient.user.findUnique({
    where: {
      username,
    },
  });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = await prismaClient.user.create({
    data: {
      name,
      username,
      password,
    },
  });
  if (!newUser) {
    return res.status(400).json({ message: "Error signing up the user" });
  }

  res
    .status(201)
    .json({ message: "User signed up successfully", userId: newUser.id });
});

app.post("/signin", (req: Request, res: Response) => {
  const result = SigninSchema.safeParse(req.body);
  if (!result.success) {
    return res.json({ message: "Incorrect Inputs" });
  }

  // Just an example
  const userId = 1;
  const token = jwt.sign({ userId }, JWT_SECRET);
  res.json({ token });
});

app.post("/room", middleware, (req: Request, res: Response) => {
  const result = CreateRoomSchema.safeParse(req.body);
  if (!result.success) {
    return res.json({ message: "Incorrect Inputs" });
  }

  // DB Call
  res.json({
    roomId: 123,
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
