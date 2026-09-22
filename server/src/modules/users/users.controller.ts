import type { Request, Response } from "express";
import * as usersService from "./users.service.js";

export async function me(req: Request, res: Response) {
  const user = await usersService.me(req.user!.id);
  res.json({ data: user });
}
