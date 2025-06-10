import { initializePriceCollection } from './market-data/index.ts';

async function startWorker() {
  try {
    console.log('🚀 Starting Enhanced Worker...');

    // Initialize price collection system
    await initializePriceCollection();

    // TODO: Add other worker services here
    // - Strategy execution engine
    // - Event processing
    // - etc.

    console.log('✅ Enhanced Worker started successfully');

  } catch (error) {
    console.error('❌ Failed to start enhanced worker:', error);
    process.exit(1);
  }
}

startWorker();