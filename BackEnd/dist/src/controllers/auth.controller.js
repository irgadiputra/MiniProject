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
exports.RegisterController = RegisterController;
exports.LoginController = LoginController;
exports.UpdateProfileController = UpdateProfileController;
exports.KeepLoginController = KeepLoginController;
exports.verifyEmailController = verifyEmailController;
exports.SendverifyEmailController = SendverifyEmailController;
const auth_service_1 = require("../services/auth.service");
const jsonwebtoken_1 = require("jsonwebtoken");
const httpError_1 = require("../utils/httpError");
function RegisterController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Registering user with data:", req.body);
            const data = yield (0, auth_service_1.RegisterService)(req.body);
            res.status(200).send({
                message: "Register Berhasil",
                data,
            });
        }
        catch (err) {
            if (err instanceof httpError_1.HttpError) {
                res.status(err.status).send({ message: err.message });
            }
            else {
                res.status(500).send({ message: "Internal Server Error" });
                next();
            }
        }
    });
}
function LoginController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, auth_service_1.LoginService)(req.body);
            res.status(200).cookie("access_token", data.token).send({
                message: "Login Berhasil",
                user: data.user,
                token: data.token
            });
        }
        catch (err) {
            if (err instanceof httpError_1.HttpError) {
                res.status(err.status).send({ message: err.message });
            }
            else {
                res.status(500).send({ message: "Internal Server Error" });
                next();
            }
        }
    });
}
function UpdateProfileController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = req.file;
            const { id } = req.user;
            const data = yield (0, auth_service_1.UpdateProfileService)(file, req.body, id);
            res.status(200).cookie("access_token", data.token).send({
                message: "update profile berhasil",
                user: data.user,
                token: data.token
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function KeepLoginController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.user;
            const data = yield (0, auth_service_1.KeepLoginService)(id);
            res.status(200).cookie("access_token", data.token).send({
                message: "ReLogin Berhasil",
                user: data.user,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function verifyEmailController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.query.token;
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
            const result = yield (0, auth_service_1.VerifyEmailService)(decoded.id);
            res.send(`<h2>${result}</h2><p>You may now close this tab.</p>`);
        }
        catch (err) {
            next(err);
        }
    });
}
function SendverifyEmailController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.user;
        try {
            yield (0, auth_service_1.SendVerifyEmailService)(id);
            res.status(200).send({
                message: "Email sent",
            });
        }
        catch (err) {
            next(err);
        }
    });
}
