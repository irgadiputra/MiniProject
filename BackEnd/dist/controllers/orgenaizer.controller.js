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
exports.getStatsController = getStatsController;
exports.getOrganizerProfileController = getOrganizerProfileController;
const organizer_service_1 = require("../services/organizer.service");
function getStatsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: organizerId } = req.user;
        const range = req.query.range;
        try {
            const stats = yield (0, organizer_service_1.getOrganizerStats)(organizerId, range);
            res.status(200).send({ stats });
        }
        catch (err) {
            next(err);
        }
    });
}
function getOrganizerProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: userId } = req.user;
            const profile = yield (0, organizer_service_1.getOrganizerProfileService)(userId);
            res.status(200).json({
                message: "Organizer profile",
                data: profile,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
