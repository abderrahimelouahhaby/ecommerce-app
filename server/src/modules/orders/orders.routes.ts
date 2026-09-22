import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import * as ordersController from "./orders.controller.js";
import { createOrderBody, orderIdParams } from "./orders.schemas.js";

const router = Router();

// Every order route requires a logged-in user.
router.use(authenticate);

router.get("/", ordersController.listMine);

router.get(
  "/:id",
  validate({ params: orderIdParams }),
  ordersController.getById,
);

router.post(
  "/:id/cancel",
  validate({ params: orderIdParams }),
  ordersController.cancel,
);

router.post("/", validate({ body: createOrderBody }), ordersController.create);

export default router;
