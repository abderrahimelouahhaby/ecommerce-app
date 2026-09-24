import type { Request, Response } from "express";
import * as productsService from "./products.service.js";

export async function list(req: Request, res: Response) {
  const query = req.validated?.query as Parameters<
    typeof productsService.list
  >[0];
  const result = await productsService.list(query);
  res.json({ data: result });
}

export async function getById(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  const product = await productsService.getActiveById(id);
  res.json({ data: product });
}