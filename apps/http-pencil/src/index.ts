import "dotenv/config";
import { prisma } from "@repo/db_pencil/client";

import express from "express";
import cors from "cors";

const app = express();
const PORT = 4001;

app.use(cors({ origin: "*" }));

app.get("/pencil-data", async (req, res) => {
  try {
    const data = await prisma.pencil.findMany({});
    return res.status(200).json({ message: "Data fetched successfully", data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the data", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on post ${PORT}`);
});
