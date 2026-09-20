import type { Request, Response } from "express";
import * as productsService from "./products.service.js";

export async function list(_req: Request, res: Response) {
  const products = await productsService.listActive();
  res.json({ data: products });
}

export async function getById(req: Request, res: Response) {
  const { id } = req.validated?.params as { id: string };
  const product = await productsService.getActiveById(id);
  res.json({ data: product });
}