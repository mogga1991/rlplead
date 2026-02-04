import { z } from 'zod';

/**
 * Validation Schemas for API Inputs
 * Uses Zod for runtime type validation and SQL injection/XSS prevention
 */

// ============================================================================
// Common Validation Patterns
// ============================================================================

/**
 * Sanitize string input to prevent XSS
 * Removes or escapes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Create a safe string validator with max length
 * Use this helper function to create validated and sanitized strings
 */
const safeString = (maxLength: number = 1000) =>
  z.string().max(maxLength).transform(sanitizeString);

/**
 * Validate alphanumeric strings (IDs, codes, etc.)
 * Prevents SQL injection in identifier fields
 */
const alphanumericString = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'Must contain only alphanumeric characters, hyphens, and underscores');

/**
 * Validate UUID format
 */
const uuidString = z
  .string()
  .uuid('Invalid UUID format');

/**
 * Validate email format
 */
const emailString = z
  .string()
  .email('Invalid email format')
  .max(255);

/**
 * Validate date string (ISO 8601)
 * Also checks that the date is actually valid
 */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
    },
    { message: 'Invalid date' }
  );

/**
 * Validate positive integer
 */
const positiveInteger = z
  .number()
  .int()
  .positive('Must be a positive integer');

/**
 * Validate non-negative number
 */
const nonNegativeNumber = z
  .number()
  .nonnegative('Must be a non-negative number');

// ============================================================================
// Search Filters Schema
// ============================================================================

export const searchFiltersSchema = z.object({
  // Property Type
  propertyType: z
    .enum(['all', 'office', 'parking', 'land'])
    .optional(),

  // Industry/Classification
  industry: safeString(200).optional(),
  naicsCodes: z.array(alphanumericString.max(10)).max(50).optional(),
  pscCodes: z.array(alphanumericString.max(10)).max(50).optional(),

  // Geography
  location: safeString(100).optional(),
  performanceLocation: safeString(100).optional(),

  // Agency
  agency: safeString(200).optional(),
  agencyCodes: z.array(alphanumericString.max(10)).max(50).optional(),

  // Keywords & Text Search
  keywords: safeString(500).optional(),
  recipientSearch: safeString(200).optional(),

  // Financial Filters
  minAwardAmount: nonNegativeNumber.max(1000000000000).optional(), // Max 1 trillion
  maxAwardAmount: nonNegativeNumber.max(1000000000000).optional(),

  // Time Period
  timeperiod: z.object({
    startDate: dateString,
    endDate: dateString,
  }).optional(),

  // Contract Type Filters
  awardTypes: z.array(safeString(50)).max(20).optional(),
  setAsideTypes: z.array(safeString(100)).max(20).optional(),
  competitionLevels: z.array(safeString(100)).max(20).optional(),

  // Special Programs
  covid19Only: z.boolean().optional(),
  infrastructureOnly: z.boolean().optional(),
  smallBusinessOnly: z.boolean().optional(),
}).refine(
  (data) => {
    // If both min and max are provided, min must be less than max
    if (data.minAwardAmount !== undefined && data.maxAwardAmount !== undefined) {
      return data.minAwardAmount <= data.maxAwardAmount;
    }
    return true;
  },
  {
    message: 'minAwardAmount must be less than or equal to maxAwardAmount',
    path: ['minAwardAmount'],
  }
).refine(
  (data) => {
    // If timeperiod is provided, start must be before end
    if (data.timeperiod) {
      return data.timeperiod.startDate <= data.timeperiod.endDate;
    }
    return true;
  },
  {
    message: 'startDate must be before or equal to endDate',
    path: ['timeperiod', 'startDate'],
  }
);

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;

// ============================================================================
// Saved Leads Schema
// ============================================================================

export const savedLeadSchema = z.object({
  companyId: z.string().min(1).max(200), // Accept any string ID (UEI or generated)
  listName: safeString(100).optional(),
  tags: z.array(safeString(50)).max(20).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: safeString(5000).optional(),
  nextAction: safeString(500).optional(),
  nextActionDate: dateString.optional(),
});

export type SavedLeadInput = z.infer<typeof savedLeadSchema>;

// ============================================================================
// Cache Invalidation Schema
// ============================================================================

export const cacheInvalidationSchema = z.object({
  prefix: z.enum(['search', 'usaspending', 'enrichment', 'company']).optional(),
  all: z.boolean().optional(),
}).refine(
  (data) => {
    // Either prefix or all=true must be provided
    return data.prefix !== undefined || data.all === true;
  },
  {
    message: 'Either prefix or all=true is required',
    path: ['prefix'],
  }
);

export type CacheInvalidationInput = z.infer<typeof cacheInvalidationSchema>;

// ============================================================================
// Job ID Schema
// ============================================================================

export const jobIdSchema = alphanumericString.min(1).max(100);

export type JobIdInput = z.infer<typeof jobIdSchema>;

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationSchema = z.object({
  page: positiveInteger.max(10000).default(1),
  pageSize: positiveInteger.min(1).max(100).default(20),
  sortBy: safeString(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate and parse input against a Zod schema
 * Throws ValidationError with user-friendly messages
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
  context?: string
): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      const field = firstError.path.join('.');
      const message = context
        ? `${context}: ${firstError.message}`
        : firstError.message;

      throw new Error(`Validation error in ${field}: ${message}`);
    }
    throw error;
  }
}

/**
 * Validate and parse input, returning safe result
 * Returns { success: true, data: T } or { success: false, error: ZodError }
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Extract validation error message from ZodError
 */
export function getValidationErrorMessage(error: z.ZodError): string {
  const firstError = error.issues[0];
  const field = firstError.path.join('.');
  return `${field}: ${firstError.message}`;
}

/**
 * Extract field name from ZodError
 */
export function getValidationErrorField(error: z.ZodError): string {
  return error.issues[0].path.join('.');
}
