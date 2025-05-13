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
exports.CreateCouponController = CreateCouponController;
exports.deleteCouponController = deleteCouponController;
const admin_service_1 = require("../services/admin.service");
function CreateCouponController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const request = req.body;
            const coupon = yield (0, admin_service_1.createCouponService)(request);
            res.status(200).json({ message: "Coupon created", data: coupon });
        }
        catch (err) {
            next(err);
        }
    });
}
function deleteCouponController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, admin_service_1.deleteCouponService)(req.params.code);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    });
}
