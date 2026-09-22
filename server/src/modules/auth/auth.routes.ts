import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import * as authController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);

router.post("/login", validate({ body: loginSchema }), authController.login);

router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.me);

export default router;
