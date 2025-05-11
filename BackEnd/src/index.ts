import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import { PORT } from "./config";
import AuthRouter from "./routers/auth.router";
import EventRouter from "./routers/event.router";
import TransactionRouter from "./routers/transaction.router";
import AdminRouter from "./routers/admin.router";
import OrganizerRouter from "./routers/organizer.router";
import { expireUserPointsTask } from "./utils/cron/user-point-task";
import { AutoCancelTransactionsTask, AutoExpireTransactionsTask } from "./utils/cron/transaction-task";

const port = PORT || 8080;
const app: Application = express();

expireUserPointsTask();
AutoCancelTransactionsTask();
AutoExpireTransactionsTask();

app.use(express.json());
app.get(
  "/api",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("test masuk");
    next()
  },
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send("ini api");
  }
);

app.use("/auth", AuthRouter);
app.use("/event", EventRouter);
app.use("/transaction", TransactionRouter);
app.use("/admin", AdminRouter);
app.use("/organizer", OrganizerRouter);
app.use("/avt", express.static(path.join(__dirname, "/public/avatar")));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
