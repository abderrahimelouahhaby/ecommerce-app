import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import * as productsController from "./products.controller.js";
import { productIdParams, productListQuery } from "./products.schemas.js";

const router = Router();

router.get("/", validate({ query: productListQuery }), productsController.list);

router.get(
  "/:id",
  validate({ params: productIdParams }),
  productsController.getById,
);

export default router;
