import { Router } from "express";
import {prisma} from "../lib/prisma.js";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json(user);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch user",
      });
    }
  }
);

export default router;