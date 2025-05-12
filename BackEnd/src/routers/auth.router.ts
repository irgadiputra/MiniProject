import { Router } from "express";
import { RegisterController, LoginController, UpdateProfileController, KeepLoginController, verifyEmailController, SendverifyEmailController} from "../controllers/auth.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { registerSchema, loginSchema} from "../schemas/user.schema";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { Multer } from "../utils/multer";
const router = Router();

router.post("/register", ReqValidator(registerSchema), RegisterController);
router.post("/login", ReqValidator(loginSchema), LoginController);
router.patch("/user", VerifyToken, Multer("diskStorage", "AVT", "avatar").single("file"), UpdateProfileController);
router.post("/relogin", VerifyToken, KeepLoginController);
router.get("/verify-email", verifyEmailController);
router.post("/verify-email",VerifyToken, SendverifyEmailController);

export default router;