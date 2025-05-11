import { Router } from "express";
import { CreateCouponController, deleteCouponController } from "../controllers/admin.controller";
import { VerifyToken, EOGuard, isAdmin } from "../middlewares/auth.middleware";
const router = Router();

router.post("/coupon", VerifyToken, isAdmin, CreateCouponController);
router.delete("/coupon/:code", VerifyToken, isAdmin, deleteCouponController)
export default router;