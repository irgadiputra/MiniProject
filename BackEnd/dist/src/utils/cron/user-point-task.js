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
exports.expireUserPointsTask = expireUserPointsTask;
const node_cron_1 = __importDefault(require("node-cron"));
const auth_service_1 = require("../../services/auth.service");
function expireUserPointsTask() {
    return __awaiter(this, void 0, void 0, function* () {
        // * pertama menandakan menit (0-59)
        // * kedua menandakan jam (0-23)
        // * ketiga menandakan hari dalam bulan (1-31)
        // * keempat menandakan bulan (1-12)
        // * kelima menandakan hari dalam minggu (0-7)
        // Run everyday at midnight
        node_cron_1.default.schedule('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Running cron: daily point expiration');
            yield (0, auth_service_1.expireUserPoints)();
        }));
    });
}
