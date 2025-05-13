"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionController = CreateTransactionController;
exports.updateTransactionStatusController = updateTransactionStatusController;
exports.UploadPaymentProofController = UploadPaymentProofController;
const transaction_service_1 = require("../services/transaction.service");
function CreateTransactionController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: userId } = req.user;
            const request = req.body;
            const transaction = yield (0, transaction_service_1.CreateTransactionService)(userId, request);
            res.status(200).json({
                message: "Transaction created successfully",
                data: transaction
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function updateTransactionStatusController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: organizerId } = req.user;
            const transactionId = parseInt(req.params.id);
            const { status } = req.body;
            const transaction = yield (0, transaction_service_1.UpdateTransactionStatusService)(organizerId, transactionId, status);
            res.status(200).json({
                message: "Transaction created successfully",
                data: transaction
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function UploadPaymentProofController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = req.file;
            const transactionId = parseInt(req.params.id);
            const data = yield (0, transaction_service_1.UploadPaymentProofService)(transactionId, file);
            res.status(200).json({
                message: "Payment proof uploaded successfully",
                data: data
            });
        }
        catch (err) {
            next(err);
        }
    });
}
