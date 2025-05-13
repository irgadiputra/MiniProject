"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const event_router_1 = __importDefault(require("./routers/event.router"));
const transaction_router_1 = __importDefault(require("./routers/transaction.router"));
const admin_router_1 = __importDefault(require("./routers/admin.router"));
const organizer_router_1 = __importDefault(require("./routers/organizer.router"));
const user_point_task_1 = require("./utils/cron/user-point-task");
const transaction_task_1 = require("./utils/cron/transaction-task");
const port = config_1.PORT || 8080;
const app = (0, express_1.default)();
exports.app = app;
(0, user_point_task_1.expireUserPointsTask)();
(0, transaction_task_1.AutoCancelTransactionsTask)();
(0, transaction_task_1.AutoExpireTransactionsTask)();
app.use(express_1.default.json());
app.get("/api", (req, res, next) => {
    console.log("test masuk");
    next();
}, (req, res, next) => {
    res.status(200).send("ini api");
});
app.use("/auth", auth_router_1.default);
app.use("/event", event_router_1.default);
app.use("/transaction", transaction_router_1.default);
app.use("/admin", admin_router_1.default);
app.use("/organizer", organizer_router_1.default);
app.use("/avt", express_1.default.static(path_1.default.join(__dirname, "/public/avatar")));
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
