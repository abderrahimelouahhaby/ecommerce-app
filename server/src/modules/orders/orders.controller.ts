import type { Request, Response } from "express";
import * as ordersService from "./orders.service.js";

export async function listMine(req: Request, res: Response) {
  const orders = await ordersService.listMine(req.user!.id);
  res.json({ data: orders });
}

export async function getById(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  const order = await ordersService.getById(req.user!, id);
  res.json({ data: order });
}

export async function create(req: Request, res: Response) {
  const body = req.validated?.body as Parameters<
    typeof ordersService.create
  >[1];
  const order = await ordersService.create(req.user!.id, body);
  res.status(201).json({ data: order });
}