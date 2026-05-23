import dns from 'dns';
import { app } from './app.js';
import { connectDb } from './config/db.js';
import envConfiguration from './config/env.js';
import { connectRedis } from './config/redis.js';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

const start = async (): Promise<void> => {
  try {
    await connectRedis();
    await connectDb();
    app.listen(envConfiguration.port, () => {
      console.log(`Server listening on port ${envConfiguration.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

void start();
