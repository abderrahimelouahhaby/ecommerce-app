import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import * as adminOrdersController from "./adminOrders.controller.js";
import {
  adminOrdersListQuery,
  orderIdParams,
  orderStatusBody,
} from "./orders.schemas.js";

const router = Router();

// Every admin order route requires a login AND the ADMIN role.
router.use(authenticate, authorize("ADMIN"));

router.get(
  "/",
  validate({ query: adminOrdersListQuery }),
  adminOrdersController.list
);

router.get(
  "/:id",
  validate({ params: orderIdParams }),
  adminOrdersController.getById
);

router.patch(
  "/:id/status",
  validate({ params: orderIdParams, body: orderStatusBody }),
  adminOrdersController.changeStatus
);

export default router;