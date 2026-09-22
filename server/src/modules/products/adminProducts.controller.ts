import type { Request, Response } from "express";
import * as adminProductsService from "./adminProducts.service.js";

export async function list(req: Request, res: Response) {
  const query = req.validated?.query as Parameters<
    typeof adminProductsService.listAdmin
  >[0];
  const result = await adminProductsService.listAdmin(query);
  res.json({ data: result });
}

export async function create(req: Request, res: Response) {
  const body = req.validated?.body as Parameters<
    typeof adminProductsService.create
  >[0];
  const product = await adminProductsService.create(body);
  res.status(201).json({ data: product });
}

export async function update(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  const body = req.validated?.body as Parameters<
    typeof adminProductsService.update
  >[1];
  const product = await adminProductsService.update(id, body);
  res.json({ data: product });
}

export async function remove(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  await adminProductsService.remove(id);
  res.status(204).send();
}
