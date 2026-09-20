import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import * as productsController from "./products.controller.js";
import { productIdParams } from "./products.schemas.js";

const router = Router();

router.get("/", productsController.list);

router.get(
  "/:id",
  validate({ params: productIdParams }),
  productsController.getById
);

export default router;