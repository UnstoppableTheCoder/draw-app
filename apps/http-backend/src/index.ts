import "dotenv/config";
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
import bcrypt from "bcryptjs";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors({ origin: "*" }));

// Get zod validation implemented
app.post("/signup", async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const result = CreateUserSchema.safeParse(req.body);
    console.log(result.success);
    if (!result.success) {
      return res.json({ message: "Incorrect Inputs" });
    }

    const { username, password } = result.data;

    const user = await prismaClient.user.findUnique({
      where: {
        username,
      },
    });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    if (!newUser) {
      return res.status(400).json({ message: "Error signing up the user" });
    }

    res
      .status(201)
      .json({ message: "User signed up successfully", userId: newUser.id });
  } catch (error) {
    return res.status(500).json({ message: "Error signing up", error });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  try {
    const result = SigninSchema.safeParse(req.body);
    if (!result.success) {
      return res.json({ message: "Incorrect Inputs" });
    }

    const { username, password } = result.data;

    const user = await prismaClient.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Username or Password is incorrect" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Error signing in", error });
  }
});

app.post("/rooms", middleware, async (req: Request, res: Response) => {
  try {
    const result = CreateRoomSchema.safeParse(req.body);
    if (!result.success) {
      return res.json({ message: "Incorrect Inputs" });
    }

    const userId = req.userId;
    const { name } = result.data;

    const room = await prismaClient.room.create({
      data: {
        slug: name,
        adminId: userId,
      },
    });
    if (!room) {
      return res.status(400).json({ message: "Error creating the room" });
    }

    // DB Call
    res.status(201).json({
      room: room,
      roomName: name,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating room", error });
  }
});

app.get("/rooms", middleware, async (req, res) => {
  try {
    console.log("Getting the rooms");
    const userId = req.userId;
    const rooms = await prismaClient.room.findMany({
      where: { adminId: userId },
    });
    return res
      .status(200)
      .json({ message: "Rooms fetched successfully", rooms });
  } catch (error) {
    res.status(500).json({ message: "Error getting the rooms", error });
  }
});

app.delete("/rooms/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Room ID not found" });

  try {
    // Delete all the shapes
    const shapes = await prismaClient.shape.deleteMany({
      where: { roomId: Number(id) },
    });

    // Delete the rooms
    const room = await prismaClient.room.delete({ where: { id: Number(id) } });
    return res.status(200).json({ message: "Room deleted successfully", room });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting the room", error });
  }
});

app.get("/canvas/:roomId", middleware, async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);

    const shapes = await prismaClient.shape.findMany({
      where: {
        roomId,
      },
      orderBy: {
        id: "desc",
      },
      //   take: 50,
    });

    console.log("Shapes: ", shapes);

    res.json({ shapes });
  } catch (error) {
    return res.status(500).json({ message: "Error getting chats", error });
  }
});

// app.get("/rooms/:slug", middleware, async (req, res) => {
//   try {
//     const { slug } = req.params;

//     console.log("Slug: ", slug);

//     const room = await prismaClient.room.findUnique({
//       where: {
//         slug,
//       },
//     });

//     res.json({
//       room,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Error getting the room", error });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
