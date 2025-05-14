import { Router } from "express";
import { CreateTransactionController, getTransactionByIdController, getTransactionListController, updateTransactionStatusController, UploadPaymentProofController } from "../controllers/transaction.controller";
import { VerifyToken, EOGuard } from "../middlewares/auth.middleware";
import { Multer } from "../utils/multer";
import { CreateTransactionSchema } from "../schemas/transaction.schema";
import ReqValidator from "../middlewares/validator.middleware";
const router = Router();

router.post("/", VerifyToken, ReqValidator(CreateTransactionSchema) , CreateTransactionController);
router.get("/:id", VerifyToken, getTransactionByIdController);
router.get("/", VerifyToken, getTransactionListController);
router.patch("/:id/status", VerifyToken, updateTransactionStatusController);
router.patch("/:id", VerifyToken, Multer("diskStorage", "AVT", "transaction").single("file"), UploadPaymentProofController);

export default router;