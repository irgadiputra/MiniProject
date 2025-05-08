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
exports.RegisterService = RegisterService;
exports.LoginService = LoginService;
exports.UpdateProfileService = UpdateProfileService;
exports.KeepLoginService = KeepLoginService;
exports.expireUserPoints = expireUserPoints;
exports.VerifyEmailService = VerifyEmailService;
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = require("bcrypt");
const config_1 = require("../config");
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = require("../utils/nodemailer");
function FindUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findFirst({
                select: {
                    email: true,
                    first_name: true,
                    last_name: true,
                    password: true,
                    id: true
                },
                where: {
                    email,
                },
            });
            return user;
        }
        catch (err) {
            throw err;
        }
    });
}
function RegisterService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isExist = yield FindUserByEmail(param.email);
            const referralBonus = 10000;
            const referrerBonus = 10000;
            const now = new Date();
            const expiryDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months from now
            let newUser = {
                id: -1,
                first_name: param.first_name,
                last_name: param.last_name,
                email: param.email
            };
            if (isExist)
                throw new Error("Email sudah terdaftar");
            yield prisma_1.default.$transaction((t) => __awaiter(this, void 0, void 0, function* () {
                let referredById = null;
                let newUserPoint = 0;
                if (param.referral_code) {
                    const referrer = yield t.user.findUnique({
                        where: { referal_code: param.referral_code },
                    });
                    if (!referrer)
                        throw new Error("Kode referral tidak valid");
                    // Reward the referrer
                    yield t.user.update({
                        where: { id: referrer.id },
                        data: {
                            point: referrer.point + referrerBonus,
                        },
                    });
                    referredById = referrer.id;
                    newUserPoint = referralBonus; // reward for being referred
                }
                const salt = (0, bcrypt_1.genSaltSync)(10);
                const hashedPassword = yield (0, bcrypt_1.hash)(param.password, salt);
                const referalCode = yield generateUniqueReferralCode();
                newUser = yield t.user.create({
                    data: {
                        first_name: param.first_name,
                        last_name: param.last_name,
                        email: param.email,
                        password: hashedPassword,
                        is_verified: false,
                        status_role: param.status_role,
                        point: newUserPoint,
                        referal_code: referalCode,
                        referred_by: referredById,
                    },
                });
                // if new user got points, add history
                if (newUserPoint > 0) {
                    yield t.pointHistory.create({
                        data: {
                            userId: newUser.id,
                            points: newUserPoint,
                            description: "Referral bonus (used someone’s referral code)",
                            expiresAt: expiryDate,
                        },
                    });
                }
            }));
            const templatePath = path_1.default.join(__dirname, "../utils/templates", "register-template.hbs");
            if (newUser.id > 0) {
                const payload = {
                    email: newUser.email,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    id: newUser.id,
                };
                const token = (0, jsonwebtoken_1.sign)(payload, String(config_1.SECRET_KEY), { expiresIn: "15m" });
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({ email: param.email, fe_url: `http://localhost:8080/auth/verify-email?token=${token}` });
                yield nodemailer_1.Transporter.sendMail({
                    from: "LoketKita",
                    to: param.email,
                    subject: "Welcome",
                    html
                });
            }
        }
        catch (err) {
            throw err;
        }
    });
}
function LoginService(param) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield FindUserByEmail(param.email);
            if (!user)
                throw new Error("Email tidak terdaftar");
            const checkPass = yield (0, bcrypt_1.compare)(param.password, user.password);
            if (!checkPass)
                throw new Error("Password Salah");
            const payload = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                id: user.id,
            };
            const token = (0, jsonwebtoken_1.sign)(payload, String(config_1.SECRET_KEY), { expiresIn: "1h" });
            return { user: payload, token };
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateProfileService(file, param, id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: id },
            });
            if (!user) {
                throw new Error("User not found");
            }
            const updateData = {};
            // Prepare update fields
            if (param.first_name)
                updateData.first_name = param.first_name;
            if (param.last_name)
                updateData.last_name = param.last_name;
            if (param.email)
                updateData.email = param.email;
            if (param.point)
                updateData.point = Number(param.point);
            if (param.is_verified)
                updateData.is_verified = Boolean(param.is_verified);
            if (file)
                updateData.profile_pict = `/public/avatar/${file.filename}`;
            // Update password if provided
            if (param.new_password) {
                if (!param.old_password) {
                    throw new Error("Old password is required to set a new password");
                }
                const isMatch = yield (0, bcrypt_1.compare)(param.old_password, user.password);
                if (!isMatch) {
                    throw new Error("Old password is incorrect");
                }
                const salt = (0, bcrypt_1.genSaltSync)(10);
                const hashedNewPassword = yield (0, bcrypt_1.hash)(param.new_password, salt);
                updateData.password = hashedNewPassword;
            }
            const updatedUser = yield prisma_1.default.user.update({
                where: { id: id },
                data: updateData,
            });
            return updatedUser;
        }
        catch (err) {
            throw err;
        }
    });
}
function KeepLoginService(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: id },
            });
            if (!user) {
                throw new Error("User not found");
            }
            const payload = {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                id: user.id,
            };
            const token = (0, jsonwebtoken_1.sign)(payload, String(config_1.SECRET_KEY), { expiresIn: "1h" });
            return { user: payload, token };
        }
        catch (err) {
            throw err;
        }
    });
}
function VerifyEmailService(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: id },
            });
            if (!user) {
                throw new Error("User not found");
            }
            yield prisma_1.default.user.update({
                where: { id: id },
                data: { is_verified: true },
            });
            return "user verified";
        }
        catch (err) {
            throw err;
        }
    });
}
//corn task
function expireUserPoints() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        // Step 1: Find expired points
        const expiredHistories = yield prisma_1.default.pointHistory.findMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
        });
        if (expiredHistories.length === 0) {
            console.log('No expired points to process.');
            return;
        }
        console.log(`Processing ${expiredHistories.length} expired point histories.`);
        // Step 2: Process all expired points inside transaction
        yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            for (const history of expiredHistories) {
                // Decrease user's points
                yield tx.user.update({
                    where: { id: history.userId },
                    data: {
                        point: {
                            decrement: history.points, // safer than doing point - x manually
                        },
                    },
                });
                // Delete expired point history
                yield tx.pointHistory.delete({
                    where: { id: history.id },
                });
            }
        }));
        console.log('Expired points processed successfully.');
    });
}
function generateUniqueReferralCode() {
    return __awaiter(this, arguments, void 0, function* (length = 8) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = "";
        while (true) {
            code = Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { referal_code: code },
            });
            if (!existingUser)
                break;
        }
        return code;
    });
}
