"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/coupon", auth_middleware_1.VerifyToken, admin_controller_1.CreateCouponController);
router.delete("/coupon/:code", auth_middleware_1.VerifyToken, admin_controller_1.deleteCouponController);
exports.default = router;
