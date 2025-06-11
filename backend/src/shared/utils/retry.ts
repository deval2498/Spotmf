/**
 * Generic retry utility with exponential backoff
 * Handles rate limits, server errors, and network failures
 */

export interface RetryOptions {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
  }
  
  export interface RetryableError extends Error {
    status?: number;
    code?: string;
  }
  
  export class RetryError extends Error {
    constructor(
      message: string,
      public readonly attempts: number,
      public readonly lastError: Error
    ) {
      super(message);
      this.name = 'RetryError';
    }
  }
  
  /**
   * Determines if an error should be retried
   */
  function isRetryableError(error: any): boolean {
    // Network/connection errors
    if (error.code === 'ECONNRESET' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND') {
      return true;
    }
  
    // HTTP status codes
    if (error.status || error.response?.status) {
      const status = error.status || error.response.status;
      
      // Rate limit errors
      if (status === 429) {
        return true;
      }
      
      // Server errors (5xx)
      if (status >= 500 && status < 600) {
        return true;
      }
    }
  
    return false;
  }
  
  /**
   * Calculates delay with exponential backoff and jitter
   */
  function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    
    // Add jitter (±10% randomness) to prevent thundering herd
    const jitter = cappedDelay * 0.1 * (Math.random() * 2 - 1);
    
    return Math.max(0, cappedDelay + jitter);
  }
  
  /**
   * Sleep utility
   */
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Retry an async operation with exponential backoff
   */
  export async function withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config: RetryOptions = {
      maxAttempts: 10,
      baseDelay: 1000,
      maxDelay: 60000,
      ...options
    };
  
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful retry if it wasn't the first attempt
        if (attempt > 1) {
          console.log(`✅ Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if error is not retryable
        if (!isRetryableError(error)) {
          console.log(`❌ Non-retryable error: ${lastError.message}`);
          throw lastError;
        }
        
        // Don't retry if this was the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }
        
        const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
        
        console.log(
          `⚠️ Attempt ${attempt}/${config.maxAttempts} failed: ${lastError.message}. ` +
          `Retrying in ${Math.round(delay)}ms...`
        );
        
        await sleep(delay);
      }
    }
    
    // All attempts failed
    throw new RetryError(
      `Operation failed after ${config.maxAttempts} attempts`,
      config.maxAttempts,
      lastError!
    );
  }
  
  /**
   * Retry utility with custom retry condition
   */
  export async function withCustomRetry<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: any) => boolean,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config: RetryOptions = {
      maxAttempts: 10,
      baseDelay: 1000,
      maxDelay: 60000,
      ...options
    };
  
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`✅ Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (!shouldRetry(error)) {
          console.log(`❌ Custom retry condition not met: ${lastError.message}`);
          throw lastError;
        }
        
        if (attempt === config.maxAttempts) {
          break;
        }
        
        const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
        
        console.log(
          `⚠️ Attempt ${attempt}/${config.maxAttempts} failed: ${lastError.message}. ` +
          `Retrying in ${Math.round(delay)}ms...`
        );
        
        await sleep(delay);
      }
    }
    
    throw new RetryError(
      `Operation failed after ${config.maxAttempts} attempts`,
      config.maxAttempts,
      lastError!
    );
  }