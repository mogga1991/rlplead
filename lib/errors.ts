/**
 * Custom Error Classes for FedLeads
 * Provides structured, user-friendly error handling across the application
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string,
    public canRetry: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      userMessage: this.userMessage || this.message,
      canRetry: this.canRetry,
    };
  }
}

/**
 * Search-related errors
 */
export class SearchError extends AppError {
  constructor(message: string, code: string, canRetry = true) {
    super(
      message,
      code,
      500,
      'Unable to search contractors. Please try again.',
      canRetry
    );
    this.name = 'SearchError';
  }
}

/**
 * USASpending API timeout error
 */
export class USASpendingTimeoutError extends SearchError {
  constructor() {
    super('USASpending API timeout', 'USASPENDING_TIMEOUT', true);
    this.userMessage =
      'The search is taking longer than expected. Please try a more specific search.';
    this.name = 'USASpendingTimeoutError';
  }
}

/**
 * USASpending API error
 */
export class USASpendingAPIError extends SearchError {
  constructor(message: string) {
    super(`USASpending API error: ${message}`, 'USASPENDING_API_ERROR', true);
    this.userMessage = 'Unable to connect to USASpending.gov. Please try again later.';
    this.name = 'USASpendingAPIError';
  }
}

/**
 * Enrichment API errors
 */
export class EnrichmentError extends AppError {
  constructor(message: string, canRetry = true) {
    super(message, 'ENRICHMENT_ERROR', 500, undefined, canRetry);
    this.userMessage = 'Unable to enrich company data. Some contact information may be missing.';
    this.name = 'EnrichmentError';
  }
}

/**
 * Apify API error
 */
export class ApifyAPIError extends EnrichmentError {
  constructor(message: string) {
    super(`Apify API error: ${message}`, true);
    this.code = 'APIFY_API_ERROR';
    this.name = 'ApifyAPIError';
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, canRetry = false) {
    super(message, 'DATABASE_ERROR', 500, undefined, canRetry);
    this.userMessage = 'A database error occurred. Please try again.';
    this.name = 'DatabaseError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400, message, false);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, message, false);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'AUTHORIZATION_ERROR', 403, message, false);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      `${resource} not found`,
      'NOT_FOUND',
      404,
      `The requested ${resource.toLowerCase()} was not found.`,
      false
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  constructor(message?: string, public retryAfter?: number) {
    const defaultMessage = 'You have made too many requests. Please try again later.';
    const userMessage = message || defaultMessage;

    super(
      'Rate limit exceeded',
      'RATE_LIMIT_EXCEEDED',
      429,
      userMessage,
      true
    );
    this.name = 'RateLimitError';
  }
}

/**
 * CSRF protection errors
 */
export class CSRFError extends AppError {
  constructor(message: string = 'Invalid CSRF token') {
    super(
      message,
      'CSRF_TOKEN_INVALID',
      403,
      'Security validation failed. Please refresh the page and try again.',
      false
    );
    this.name = 'CSRFError';
  }
}

/**
 * Job errors
 */
export class JobError extends AppError {
  constructor(message: string, jobId: string, canRetry = true) {
    super(
      `Job ${jobId}: ${message}`,
      'JOB_ERROR',
      500,
      'The background job encountered an error. Please try again.',
      canRetry
    );
    this.name = 'JobError';
  }
}

/**
 * Helper function to check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.canRetry;
  }

  // Network errors are generally retryable
  if (error.name === 'FetchError' || error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors are retryable
  if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    return true;
  }

  return false;
}

/**
 * Helper function to get user-friendly error message
 */
export function getUserMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }

  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Helper function to get error code
 */
export function getErrorCode(error: Error): string {
  if (error instanceof AppError) {
    return error.code;
  }

  return 'UNKNOWN_ERROR';
}
