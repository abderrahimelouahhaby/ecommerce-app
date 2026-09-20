import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as usersController from "./users.controller.js";

const router = Router();

router.get("/me", authenticate, usersController.me);

export default router;