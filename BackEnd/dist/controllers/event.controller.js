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
exports.CreateEventController = CreateEventController;
exports.GetEventListController = GetEventListController;
exports.SearchEventController = SearchEventController;
exports.UpdateEventController = UpdateEventController;
exports.DeleteEventController = DeleteEventController;
exports.CreateVoucherController = CreateVoucherController;
exports.deleteVoucherController = deleteVoucherController;
exports.getEventAttendeesController = getEventAttendeesController;
exports.createReviewController = createReviewController;
const event_service_1 = require("../services/event.service");
function CreateEventController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.user;
            const request = req.body;
            const file = req.file;
            const data = yield (0, event_service_1.CreateEventService)(request, id, file);
            res.status(200).send({
                message: "Event Berhasil dibuat",
                data,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function UpdateEventController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const eventId = parseInt(req.params.id);
            const file = req.file;
            const request = req.body;
            const data = yield (0, event_service_1.UpdateEventService)(eventId, request, file);
            res.status(200).json({
                message: "Event updated successfully",
                data,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function GetEventListController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const events = yield (0, event_service_1.GetEventListService)({ skip, limit });
            res.status(200).json({
                message: "List of Events",
                data: events,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function SearchEventController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, location, status, page = 1, limit = 10 } = req.query;
            const searchParams = {
                name: name,
                location: location,
                status: status,
                page: parseInt(page),
                limit: parseInt(limit),
            };
            const data = yield (0, event_service_1.SearchEventService)(searchParams);
            res.status(200).json({
                message: "Search event success",
                data,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function DeleteEventController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const eventId = parseInt(req.params.id);
            const deletedEvent = yield (0, event_service_1.DeleteEventService)(eventId);
            res.status(200).json({
                message: "Event deleted successfully",
                data: deletedEvent,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function CreateVoucherController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const eventId = parseInt(req.params.id);
            const request = req.body;
            const result = yield (0, event_service_1.CreateVoucherService)(Number(eventId), request);
            res.status(201).json({ message: "Voucher created", data: result });
        }
        catch (err) {
            next(err);
        }
    });
}
function deleteVoucherController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const eventId = parseInt(req.params.id);
            const code = req.params.code;
            const deletedEvent = yield (0, event_service_1.deleteVoucherService)(Number(eventId), code);
            res.status(200).json({
                message: "Event deleted successfully",
                data: deletedEvent,
            });
            res.json({ message: "Voucher deleted successfully" });
        }
        catch (err) {
            next(err);
        }
    });
}
function getEventAttendeesController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const eventId = parseInt(req.params.id);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const result = yield (0, event_service_1.getEventAttendeesService)(eventId, { skip, limit });
            res.status(201).json({
                message: 'Event attendee list ',
                data: result
            });
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    });
}
function createReviewController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const eventId = parseInt(req.params.id);
            const { id: userId } = req.user;
            const request = req.body;
            const createdReview = yield (0, event_service_1.createReviewService)(userId, Number(eventId), request);
            res.status(200).json({
                message: "Review created successfully",
                data: createdReview,
            });
            res.json({ message: "Review created successfully" });
        }
        catch (err) {
            next(err);
        }
    });
}
