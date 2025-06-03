// src/server.ts
import { createApp } from './app.js';
import { db } from './shared/config/Database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await db.connect();

    // Create and start app
    const app = createApp();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

startServer();