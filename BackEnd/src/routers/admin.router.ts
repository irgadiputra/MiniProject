import { Router } from "express";
import { CreateCouponController, deleteCouponController } from "../controllers/admin.controller";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
const router = Router();

router.post("/coupon", VerifyToken, CreateCouponController);
router.delete("/coupon/:code", VerifyToken, deleteCouponController)
export default router;