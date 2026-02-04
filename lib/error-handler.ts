/**
 * Error Handling Middleware and Utilities
 * Provides consistent error handling across API routes
 */

import { NextResponse } from 'next/server';
import { AppError, getUserMessage, getErrorCode, isRetryableError, RateLimitError } from './errors';
import { log } from './logger';

/**
 * API Error Response Interface
 */
export interface APIErrorResponse {
  error: string;
  code: string;
  canRetry: boolean;
  statusCode?: number;
  field?: string;
  details?: any;
}

/**
 * Handle API errors and return formatted response
 */
export function handleAPIError(error: unknown, context?: any): NextResponse<APIErrorResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    log.error(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      canRetry: error.canRetry,
      context,
      stack: error.stack,
    });

    const headers: Record<string, string> = {};

    // Add Retry-After header for rate limit errors
    if (error instanceof RateLimitError && error.retryAfter) {
      headers['Retry-After'] = error.retryAfter.toString();
    }

    return NextResponse.json(
      {
        error: error.userMessage || error.message,
        code: error.code,
        canRetry: error.canRetry,
        field: (error as any).field,
      },
      {
        status: error.statusCode,
        headers,
      }
    );
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    log.error('Unhandled error', {
      message: error.message,
      name: error.name,
      context,
      stack: error.stack,
    });

    const canRetry = isRetryableError(error);
    const userMessage = getUserMessage(error);
    const code = getErrorCode(error);

    return NextResponse.json(
      {
        error: userMessage,
        code,
        canRetry,
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  log.error('Unknown error type', {
    error: String(error),
    context,
  });

  return NextResponse.json(
    {
      error: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      canRetry: true,
    },
    { status: 500 }
  );
}

/**
 * Async error handler wrapper for API routes
 * Catches errors and returns formatted responses
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error, {
        handler: handler.name,
        args: args.length,
      });
    }
  };
}

/**
 * Retry utility with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      log.warn(`Retry attempt ${attempt}/${maxAttempts}`, {
        error: lastError.message,
        delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for async functions
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    log.warn('JSON parse error', { error, json: json.substring(0, 100) });
    return fallback;
  }
}

/**
 * Validate required environment variables
 */
export function validateEnv(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
