import { Router } from "express";
import { CreateTransactionController, updateTransactionStatusController, UploadPaymentProofController } from "../controllers/transaction.controller";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { Multer } from "../utils/multer";
const router = Router();

router.post("/", VerifyToken, CreateTransactionController);
router.patch("/:id/status", VerifyToken, updateTransactionStatusController);
router.patch("/:id", VerifyToken, Multer("diskStorage", "AVT", "avatar").single("file"), UploadPaymentProofController);

export default router;