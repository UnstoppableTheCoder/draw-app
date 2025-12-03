import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  let token = req.headers["authorization"] ?? "";
  token = token.split(" ")[1]!;

  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded === "string") return; // it can be either string or JwtPayload

  if (decoded) {
    req.userId = decoded.userId;

    next();
  } else {
    res.status(403).json({
      message: "Unauthorized",
    });
  }
}
