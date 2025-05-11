"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../utils/multer");
const transaction_schema_1 = require("../schemas/transaction.schema");
const validator_middleware_1 = __importDefault(require("../middlewares/validator.middleware"));
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.VerifyToken, (0, validator_middleware_1.default)(transaction_schema_1.CreateTransactionSchema), transaction_controller_1.CreateTransactionController);
router.patch("/:id/status", auth_middleware_1.VerifyToken, transaction_controller_1.updateTransactionStatusController);
router.patch("/:id", auth_middleware_1.VerifyToken, (0, multer_1.Multer)("diskStorage", "AVT", "avatar").single("file"), transaction_controller_1.UploadPaymentProofController);
exports.default = router;
