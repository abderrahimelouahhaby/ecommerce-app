import type { Request, Response } from "express";
import * as adminOrdersService from "./adminOrders.service.js";

export async function list(req: Request, res: Response) {
  const query = req.validated?.query as Parameters<
    typeof adminOrdersService.listAdmin
  >[0];
  const result = await adminOrdersService.listAdmin(query);
  res.json({ data: result });
}

export async function getById(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  const order = await adminOrdersService.getById(id);
  res.json({ data: order });
}

export async function changeStatus(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  const body = req.validated?.body as {
    status: Parameters<typeof adminOrdersService.changeStatus>[1];
  };
  const order = await adminOrdersService.changeStatus(id, body.status);
  res.json({ data: order });
}
