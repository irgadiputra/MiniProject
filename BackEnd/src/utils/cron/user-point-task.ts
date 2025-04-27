import cron from "node-cron";
import {expireUserPoints} from "../../services/auth.service";

async function expireUserPointsTask() {
    // * pertama menandakan menit (0-59)
    // * kedua menandakan jam (0-23)
    // * ketiga menandakan hari dalam bulan (1-31)
    // * keempat menandakan bulan (1-12)
    // * kelima menandakan hari dalam minggu (0-7)
    // Run everyday at midnight
    cron.schedule('0 0 * * *', async () => {
    console.log('Running daily point expiration job...');
    await expireUserPoints();
  });
}

export { expireUserPointsTask }