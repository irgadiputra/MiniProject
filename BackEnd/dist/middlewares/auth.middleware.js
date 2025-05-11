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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyToken = VerifyToken;
exports.EOGuard = EOGuard;
exports.isEventOrganizer = isEventOrganizer;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../lib/prisma"));
function VerifyToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw new Error("Unauthorized");
            const verifyUser = (0, jsonwebtoken_1.verify)(token, String(config_1.SECRET_KEY));
            if (!verifyUser)
                throw new Error("Invalid Token");
            req.user = verifyUser;
            next();
        }
        catch (err) {
            next(err);
        }
    });
}
function EOGuard(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) !== "Event Organizer")
                throw new Error("Restricted");
            next();
        }
        catch (err) {
            next(err);
        }
    });
}
function isEventOrganizer(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventId = parseInt(req.params.id);
        const { id: userId } = req.user;
        const event = yield prisma_1.default.event.findUnique({
            where: { id: eventId },
        });
        if (!event)
            throw new Error("Event not found");
        if (event.organizer_id !== userId)
            throw new Error("Unauthorized");
    });
}
function isAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: userId } = req.user;
        const user = yield prisma_1.default.event.findUnique({
            where: { id: userId },
        });
        if ((user === null || user === void 0 ? void 0 : user.status) != "admin")
            throw new Error("Unauthorized");
    });
}
