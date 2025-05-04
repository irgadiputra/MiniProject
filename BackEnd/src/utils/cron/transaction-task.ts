import cron from "node-cron";
import { AutoCancelTransactions, AutoExpireTransactions } from "../../services/transaction.service";

async function AutoExpireTransactionsTask() {
    cron.schedule("*/10 * * * *", async () => {
        console.log("Running cron: expire unpaid transactions");
        await AutoExpireTransactions();
    });
}

async function AutoCancelTransactionsTask() {
    cron.schedule("0 * * * *", async () => {
        console.log("Running cron: cancel unconfirmed transactions");
        await AutoCancelTransactions();
    });
}

export { AutoExpireTransactionsTask, AutoCancelTransactionsTask }