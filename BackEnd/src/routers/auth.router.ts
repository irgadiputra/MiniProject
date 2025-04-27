import { Router } from "express";
import { RegisterController, LoginController, UpdateProfileController} from "../controllers/auth.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { registerSchema, loginSchema } from "../schemas/user.schema";
const router = Router();

router.post("/register", ReqValidator(registerSchema), RegisterController);
router.post("/login", ReqValidator(loginSchema), LoginController);
router.put("/updateprofile", UpdateProfileController);


export default router;