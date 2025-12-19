/**
 * CodeRabbit configuration schema validator
 * 
 * Validates .coderabbit.yaml configuration files to ensure
 * they conform to the expected structure and constraints.
 */

import { z } from 'zod';

/**
 * Language code schema - validates ISO 639-1 two-letter language codes
 */
export const languageSchema = z
  .string()
  .length(2, 'Language must be a 2-letter ISO 639-1 code')
  .regex(/^[a-z]{2}$/, 'Language must be lowercase letters only');

/**
 * Path filter schema - validates glob patterns for file filtering
 * Supports negation with "!" prefix and glob patterns
 */
export const pathFilterSchema = z
  .string()
  .min(1, 'Path filter cannot be empty')
  .refine(
    (val) => {
      // Check for valid glob patterns
      const validPatternChars = /^[!*a-zA-Z0-9_.\-\/]+$/;
      return validPatternChars.test(val);
    },
    { message: 'Path filter contains invalid characters' }
  );

/**
 * Auto review configuration schema
 */
export const autoReviewSchema = z.object({
  enabled: z.boolean({
    required_error: 'auto_review.enabled is required',
    invalid_type_error: 'auto_review.enabled must be a boolean',
  }),
});

/**
 * Reviews configuration schema
 */
export const reviewsSchema = z.object({
  auto_review: autoReviewSchema,
  path_filters: z
    .array(pathFilterSchema)
    .min(1, 'At least one path filter is required')
    .optional(),
  review_comment_lgtm: z
    .boolean({
      invalid_type_error: 'review_comment_lgtm must be a boolean',
    })
    .optional(),
});

/**
 * Chat configuration schema
 */
export const chatSchema = z.object({
  auto_reply: z.boolean({
    required_error: 'chat.auto_reply is required',
    invalid_type_error: 'chat.auto_reply must be a boolean',
  }),
});

/**
 * Complete CodeRabbit configuration schema
 */
export const codeRabbitConfigSchema = z.object({
  language: languageSchema,
  reviews: reviewsSchema,
  chat: chatSchema.optional(),
});

/**
 * Type inference from schema
 */
export type CodeRabbitConfig = z.infer<typeof codeRabbitConfigSchema>;
export type AutoReviewConfig = z.infer<typeof autoReviewSchema>;
export type ReviewsConfig = z.infer<typeof reviewsSchema>;
export type ChatConfig = z.infer<typeof chatSchema>;

/**
 * Validate CodeRabbit configuration
 * 
 * @param config - Configuration object to validate
 * @returns Validation result with parsed data or error details
 */
export function validateCodeRabbitConfig(config: unknown) {
  return codeRabbitConfigSchema.safeParse(config);
}

/**
 * Validate path filter patterns
 * 
 * @param patterns - Array of path filter patterns
 * @returns true if all patterns are valid, false otherwise
 */
export function validatePathFilters(patterns: string[]): boolean {
  try {
    z.array(pathFilterSchema).parse(patterns);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path filter is a negation pattern
 * 
 * @param pattern - Path filter pattern
 * @returns true if pattern starts with "!"
 */
export function isNegationPattern(pattern: string): boolean {
  return pattern.startsWith('!');
}

/**
 * Extract glob pattern from path filter (removes "!" if present)
 * 
 * @param pattern - Path filter pattern
 * @returns Glob pattern without negation prefix
 */
export function extractGlobPattern(pattern: string): string {
  return isNegationPattern(pattern) ? pattern.slice(1) : pattern;
}