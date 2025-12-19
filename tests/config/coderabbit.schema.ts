import { z } from 'zod';

/**
 * Zod schema for validating .coderabbit.yaml configuration
 * Based on CodeRabbit's official configuration schema
 */

// Language code validation
const LanguageSchema = z.enum([
  'en', 'ja', 'zh-CN', 'zh-TW', 'ko', 'es', 'fr', 'de', 'pt', 'ru'
]).describe('Language for CodeRabbit responses');

// Path filter pattern validation
const PathFilterSchema = z.string()
  .regex(/^!?[\w\*\.\-\/]+$/, 'Invalid path filter pattern')
  .describe('Glob pattern for path filtering');

// Auto review configuration
const AutoReviewSchema = z.object({
  enabled: z.boolean()
    .describe('Enable automatic code reviews'),
}).strict();

// Reviews configuration
const ReviewsSchema = z.object({
  auto_review: AutoReviewSchema
    .describe('Configuration for automatic reviews'),
  path_filters: z.array(PathFilterSchema)
    .min(1, 'At least one path filter is required')
    .describe('List of glob patterns to include/exclude from reviews'),
  review_comment_lgtm: z.boolean()
    .describe('Whether to comment LGTM on approved reviews'),
}).strict();

// Chat configuration
const ChatSchema = z.object({
  auto_reply: z.boolean()
    .describe('Enable automatic replies in chat'),
}).strict();

// Main CodeRabbit configuration schema
export const CodeRabbitConfigSchema = z.object({
  language: LanguageSchema
    .describe('Language for CodeRabbit interactions'),
  reviews: ReviewsSchema
    .describe('Review behavior configuration'),
  chat: ChatSchema
    .describe('Chat behavior configuration'),
}).strict();

export type CodeRabbitConfig = z.infer<typeof CodeRabbitConfigSchema>;

// Helper to validate path filter patterns
export const isValidPathFilter = (pattern: string): boolean => {
  // Check if it's a valid glob pattern
  const validPatternRegex = /^!?[\w\*\.\-\/\[\]\{\}\(\)\,\s]+$/;
  return validPatternRegex.test(pattern);
};

// Helper to check if a path would be excluded by filters
export const isPathExcluded = (path: string, filters: string[]): boolean => {
  for (const filter of filters) {
    if (filter.startsWith('!')) {
      const pattern = filter.slice(1);
      // Simple glob matching for common patterns
      const regex = new RegExp(
        '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
      );
      if (regex.test(path)) {
        return true;
      }
    }
  }
  return false;
};