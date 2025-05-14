"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validator_middleware_1 = __importDefault(require("../middlewares/validator.middleware"));
const user_schema_1 = require("../schemas/user.schema");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
router.post("/register", (0, validator_middleware_1.default)(user_schema_1.registerSchema), auth_controller_1.RegisterController);
router.post("/login", (0, validator_middleware_1.default)(user_schema_1.loginSchema), auth_controller_1.LoginController);
router.patch("/user", auth_middleware_1.VerifyToken, (0, multer_1.Multer)("diskStorage", "AVT", "avatar").single("profile_pict"), auth_controller_1.UpdateProfileController);
router.post("/relogin", auth_middleware_1.VerifyToken, auth_controller_1.KeepLoginController);
router.get("/verify-email", auth_controller_1.verifyEmailController);
router.post("/verify-email", auth_middleware_1.VerifyToken, auth_controller_1.SendverifyEmailController);
exports.default = router;
