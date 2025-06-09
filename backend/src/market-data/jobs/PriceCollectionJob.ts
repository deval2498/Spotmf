import { HyperswapPriceService } from "../services/HyperswapPriceService.ts";

export class PriceCollectionJob {
    private isRunning = false;
    private intervalId: NodeJS.Timeout | null = null;

    constructor( private priceService: HyperswapPriceService) {}

    start(intervalMinutes: number = 5): void {
        if (this.isRunning) {
            console.log('Price collection job already running');
            return;
          }

        console.log("Starting price collection job every:", intervalMinutes, "minutes")

        this.isRunning = true

        this.collectPrices()

        this.intervalId = setInterval(() => {
            this.collectPrices();
          }, intervalMinutes * 60 * 1000);
    }

    stop(): void {
        if (!this.isRunning) return;
    
        console.log('🛑 Stopping price collection job');
        this.isRunning = false;
    
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }

      async gracefulShutdown(): Promise<void> {
        this.stop();
        console.log('✅ Price collection job stopped gracefully');
      }

    private async collectPrices(): Promise<void> {
        try {
          console.log(`⏰ [${new Date().toISOString()}] Collecting prices...`);
          await this.priceService.saveCurrentPrices();
        } catch (error) {
          console.error('Failed to collect prices:', error);
        }
      }
    
}