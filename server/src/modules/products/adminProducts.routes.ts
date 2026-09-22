import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import * as adminProductsController from "./adminProducts.controller.js";
import {
  adminListQuery,
  productCreateBody,
  productIdParams,
  productUpdateBody,
} from "./products.schemas.js";

const router = Router();

// Every admin route needs a login AND the ADMIN role.
router.use(authenticate, authorize("ADMIN"));

router.get(
  "/",
  validate({ query: adminListQuery }),
  adminProductsController.list,
);

router.post(
  "/",
  validate({ body: productCreateBody }),
  adminProductsController.create,
);

router.patch(
  "/:id",
  validate({ params: productIdParams, body: productUpdateBody }),
  adminProductsController.update,
);

router.delete(
  "/:id",
  validate({ params: productIdParams }),
  adminProductsController.remove,
);

export default router;
