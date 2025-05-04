import { Request, Response, NextFunction } from "express";
import { createCouponService, deleteCouponService } from "../services/admin.service";
import { IUserReqParam } from "../custom";
import { CreateCoupon } from "../type/admin.type";

async function CreateCouponController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const request = req.body as CreateCoupon;
        const { id: userId } = req.user as IUserReqParam;
        const coupon = await createCouponService(userId, request);

        res.status(201).json({ message: "Coupon created", data: coupon });
    } catch (err) {
        next(err);
    }
}

async function deleteCouponController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { id: userId } = req.user as IUserReqParam;
        const result = await deleteCouponService(userId, req.params.code);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export { CreateCouponController, deleteCouponController }