const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`CMS API listening on port ${env.port} [${env.nodeEnv}]`);

  // Self-ping every 10 minutes to prevent Render free tier spin-down
  if (env.nodeEnv === 'production') {
    const BACKEND_URL = process.env.BACKEND_URL || `https://cms-backend-j2yg.onrender.com`;
    setInterval(async () => {
      try {
        await fetch(`${BACKEND_URL}/api/v1/health`);
        console.log('Keep-alive ping sent');
      } catch (err) {
        console.error('Keep-alive ping failed:', err.message);
      }
    }, 10 * 60 * 1000); // every 10 minutes
  }
});