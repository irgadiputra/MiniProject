import { Request, Response, NextFunction } from "express";
import { CreateTransactionService, UpdateTransactionStatusService, UploadPaymentProofService } from "../services/transaction.service";
import { IUserReqParam } from "../custom";
import { CreateTransaction } from "../type/transaction.type";

async function CreateTransactionController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } = req.user as IUserReqParam;
        const request = req.body as CreateTransaction;

        const transaction = await CreateTransactionService(userId, request);

        res.status(201).json({
            message: "Transaction created successfully",
            data: transaction
        });
    } catch (err) {
        next(err);
    }
}

async function updateTransactionStatusController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: organizerId } = req.user as IUserReqParam;
        const transactionId = parseInt(req.params.id);
        const { status } = req.body;

        const transaction = await UpdateTransactionStatusService(organizerId, transactionId, status);

        res.status(201).json({
            message: "Transaction created successfully",
            data: transaction
        });
    } catch (err) {
        next(err);
    }
}

async function UploadPaymentProofController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const file = req.file as Express.Multer.File;
        const transactionId = parseInt(req.params.id);
        const data = await UploadPaymentProofService(transactionId, file);

        res.status(201).json({
            message: "Payment proof uploaded successfully",
            data: data
        });
    } catch (err) {
        next(err);
    }
}


export { CreateTransactionController, updateTransactionStatusController, UploadPaymentProofController }