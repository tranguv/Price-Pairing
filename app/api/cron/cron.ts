import cron from 'node-cron';
import { getUpdatedProducts } from './route';

// Schedule a cron job to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running price update job...');
  try {
    await getUpdatedProducts();
  } catch (error) {
    console.error('Error updating products:', error);
  }
});
