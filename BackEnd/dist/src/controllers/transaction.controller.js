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
exports.getTransactionListService = void 0;
exports.getTransactionListController = getTransactionListController;
exports.CreateTransactionController = CreateTransactionController;
exports.updateTransactionStatusController = updateTransactionStatusController;
exports.UploadPaymentProofController = UploadPaymentProofController;
exports.getTransactionByIdController = getTransactionByIdController;
const transaction_service_1 = require("../services/transaction.service");
Object.defineProperty(exports, "getTransactionListService", { enumerable: true, get: function () { return transaction_service_1.getTransactionListService; } });
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
function getTransactionByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: userId } = req.user;
            const transactionId = parseInt(req.params.id);
            const transaction = yield (0, transaction_service_1.getTransactionByIdService)(userId, transactionId);
            res.status(200).json({
                message: "Transaction retrieved successfully",
                data: transaction
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getTransactionListController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: userId } = req.user;
            const transactions = yield (0, transaction_service_1.getTransactionListService)(userId);
            res.status(200).json({
                message: "Transactions retrieved successfully",
                data: transactions
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
