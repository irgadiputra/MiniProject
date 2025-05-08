"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODEMAILER_PASS = exports.NODEMAILER_USER = exports.SECRET_KEY = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.SECRET_KEY = _a.SECRET_KEY, exports.NODEMAILER_USER = _a.NODEMAILER_USER, exports.NODEMAILER_PASS = _a.NODEMAILER_PASS;
