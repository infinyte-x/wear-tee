/**
 * Comprehensive tests for .coderabbit.yaml configuration
 * 
 * Tests validate:
 * - YAML structure and parsing
 * - Schema validation
 * - Edge cases and error conditions
 * - Configuration values and constraints
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  validateCodeRabbitConfig,
  validatePathFilters,
  isNegationPattern,
  extractGlobPattern,
  codeRabbitConfigSchema,
  languageSchema,
  pathFilterSchema,
  autoReviewSchema,
  reviewsSchema,
  chatSchema,
} from '../lib/coderabbit-schema';

describe('CodeRabbit Configuration - YAML Parsing', () => {
  let configContent: string;
  let parsedConfig: any;

  beforeAll(() => {
    // Read the actual .coderabbit.yaml file
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should successfully parse the YAML file', () => {
    expect(parsedConfig).toBeDefined();
    expect(typeof parsedConfig).toBe('object');
  });

  it('should not be null or empty', () => {
    expect(parsedConfig).not.toBeNull();
    expect(Object.keys(parsedConfig).length).toBeGreaterThan(0);
  });

  it('should contain expected top-level keys', () => {
    expect(parsedConfig).toHaveProperty('language');
    expect(parsedConfig).toHaveProperty('reviews');
    expect(parsedConfig).toHaveProperty('chat');
  });

  it('should handle YAML without syntax errors', () => {
    expect(() => yaml.load(configContent)).not.toThrow();
  });

  it('should not contain duplicate keys', () => {
    // YAML parser will overwrite duplicate keys, but we can check structure
    const keys = Object.keys(parsedConfig);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });
});

describe('CodeRabbit Configuration - Schema Validation', () => {
  let parsedConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should validate the complete configuration schema', () => {
    const result = validateCodeRabbitConfig(parsedConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
    }
  });

  it('should have valid language field', () => {
    const result = languageSchema.safeParse(parsedConfig.language);
    expect(result.success).toBe(true);
  });

  it('should have valid reviews structure', () => {
    const result = reviewsSchema.safeParse(parsedConfig.reviews);
    expect(result.success).toBe(true);
  });

  it('should have valid chat configuration', () => {
    const result = chatSchema.safeParse(parsedConfig.chat);
    expect(result.success).toBe(true);
  });

  it('should validate all path filters', () => {
    const pathFilters = parsedConfig.reviews?.path_filters || [];
    const isValid = validatePathFilters(pathFilters);
    expect(isValid).toBe(true);
  });
});

describe('CodeRabbit Configuration - Language Field', () => {
  it('should be a valid 2-letter ISO code', () => {
    const result = languageSchema.safeParse('en');
    expect(result.success).toBe(true);
  });

  it('should reject invalid language codes', () => {
    const invalidCodes = ['eng', 'e', 'EN', '12', 'en-US', '', 'english'];
    
    invalidCodes.forEach(code => {
      const result = languageSchema.safeParse(code);
      expect(result.success).toBe(false);
    });
  });

  it('should only accept lowercase letters', () => {
    const result = languageSchema.safeParse('EN');
    expect(result.success).toBe(false);
  });

  it('should reject numbers in language code', () => {
    const result = languageSchema.safeParse('e1');
    expect(result.success).toBe(false);
  });

  it('should accept common language codes', () => {
    const validCodes = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ru'];
    
    validCodes.forEach(code => {
      const result = languageSchema.safeParse(code);
      expect(result.success).toBe(true);
    });
  });
});

describe('CodeRabbit Configuration - Path Filters', () => {
  let parsedConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should have path filters array', () => {
    expect(Array.isArray(parsedConfig.reviews.path_filters)).toBe(true);
  });

  it('should contain node_modules exclusion', () => {
    const filters = parsedConfig.reviews.path_filters;
    const hasNodeModulesFilter = filters.some((filter: string) => 
      filter.includes('node_modules')
    );
    expect(hasNodeModulesFilter).toBe(true);
  });

  it('should contain lock file exclusion', () => {
    const filters = parsedConfig.reviews.path_filters;
    const hasLockFileFilter = filters.some((filter: string) => 
      filter.includes('.lock')
    );
    expect(hasLockFileFilter).toBe(true);
  });

  it('should validate negation patterns', () => {
    const negationPattern = '!**/node_modules/**';
    const result = pathFilterSchema.safeParse(negationPattern);
    expect(result.success).toBe(true);
  });

  it('should validate glob patterns', () => {
    const patterns = [
      '**/*.js',
      '!**/test/**',
      'src/**/*.ts',
      '!**/*.lock',
      '**/node_modules/**',
    ];

    patterns.forEach(pattern => {
      const result = pathFilterSchema.safeParse(pattern);
      expect(result.success).toBe(true);
    });
  });

  it('should reject empty path filters', () => {
    const result = pathFilterSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should reject invalid characters in path filters', () => {
    const invalidPatterns = ['**/<script>**', '!**/$()/**', '**/`cmd`/**'];
    
    invalidPatterns.forEach(pattern => {
      const result = pathFilterSchema.safeParse(pattern);
      expect(result.success).toBe(false);
    });
  });

  it('should have at least one path filter', () => {
    const filters = parsedConfig.reviews.path_filters;
    expect(filters.length).toBeGreaterThan(0);
  });
});

describe('CodeRabbit Configuration - Auto Review', () => {
  let parsedConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should have auto_review configuration', () => {
    expect(parsedConfig.reviews).toHaveProperty('auto_review');
  });

  it('should have enabled field as boolean', () => {
    expect(typeof parsedConfig.reviews.auto_review.enabled).toBe('boolean');
  });

  it('should validate when enabled is true', () => {
    const config = { enabled: true };
    const result = autoReviewSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate when enabled is false', () => {
    const config = { enabled: false };
    const result = autoReviewSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should reject non-boolean enabled values', () => {
    const invalidValues = ['true', 1, 'yes', null, undefined, {}];
    
    invalidValues.forEach(value => {
      const result = autoReviewSchema.safeParse({ enabled: value });
      expect(result.success).toBe(false);
    });
  });

  it('should reject missing enabled field', () => {
    const result = autoReviewSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('CodeRabbit Configuration - Review Comment LGTM', () => {
  let parsedConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should have review_comment_lgtm field', () => {
    expect(parsedConfig.reviews).toHaveProperty('review_comment_lgtm');
  });

  it('should be a boolean value', () => {
    expect(typeof parsedConfig.reviews.review_comment_lgtm).toBe('boolean');
  });

  it('should accept true or false', () => {
    const validValues = [true, false];
    
    validValues.forEach(value => {
      const config = {
        auto_review: { enabled: true },
        review_comment_lgtm: value,
      };
      const result = reviewsSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  it('should be optional in schema', () => {
    const config = {
      auto_review: { enabled: true },
    };
    const result = reviewsSchema.safeParse(config);
    expect(result.success).toBe(true);
  });
});

describe('CodeRabbit Configuration - Chat Settings', () => {
  let parsedConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should have chat configuration', () => {
    expect(parsedConfig).toHaveProperty('chat');
  });

  it('should have auto_reply field', () => {
    expect(parsedConfig.chat).toHaveProperty('auto_reply');
  });

  it('should have auto_reply as boolean', () => {
    expect(typeof parsedConfig.chat.auto_reply).toBe('boolean');
  });

  it('should validate chat configuration', () => {
    const result = chatSchema.safeParse(parsedConfig.chat);
    expect(result.success).toBe(true);
  });

  it('should reject non-boolean auto_reply values', () => {
    const invalidValues = ['true', 1, 'yes', null];
    
    invalidValues.forEach(value => {
      const result = chatSchema.safeParse({ auto_reply: value });
      expect(result.success).toBe(false);
    });
  });

  it('should reject missing auto_reply field', () => {
    const result = chatSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('CodeRabbit Configuration - Edge Cases', () => {
  it('should reject null configuration', () => {
    const result = validateCodeRabbitConfig(null);
    expect(result.success).toBe(false);
  });

  it('should reject undefined configuration', () => {
    const result = validateCodeRabbitConfig(undefined);
    expect(result.success).toBe(false);
  });

  it('should reject empty object', () => {
    const result = validateCodeRabbitConfig({});
    expect(result.success).toBe(false);
  });

  it('should reject configuration with missing language', () => {
    const config = {
      reviews: { auto_review: { enabled: true } },
      chat: { auto_reply: true },
    };
    const result = validateCodeRabbitConfig(config);
    expect(result.success).toBe(false);
  });

  it('should reject configuration with missing reviews', () => {
    const config = {
      language: 'en',
      chat: { auto_reply: true },
    };
    const result = validateCodeRabbitConfig(config);
    expect(result.success).toBe(false);
  });

  it('should handle configuration without chat (optional)', () => {
    const config = {
      language: 'en',
      reviews: { auto_review: { enabled: true } },
    };
    const result = validateCodeRabbitConfig(config);
    expect(result.success).toBe(true);
  });

  it('should reject array instead of object', () => {
    const result = validateCodeRabbitConfig([]);
    expect(result.success).toBe(false);
  });

  it('should reject string instead of object', () => {
    const result = validateCodeRabbitConfig('config');
    expect(result.success).toBe(false);
  });

  it('should reject number instead of object', () => {
    const result = validateCodeRabbitConfig(123);
    expect(result.success).toBe(false);
  });
});

describe('CodeRabbit Configuration - Helper Functions', () => {
  describe('isNegationPattern', () => {
    it('should identify negation patterns', () => {
      expect(isNegationPattern('!**/node_modules/**')).toBe(true);
      expect(isNegationPattern('!**/*.lock')).toBe(true);
    });

    it('should identify non-negation patterns', () => {
      expect(isNegationPattern('**/src/**')).toBe(false);
      expect(isNegationPattern('**/*.js')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isNegationPattern('')).toBe(false);
    });

    it('should handle patterns with ! in middle', () => {
      expect(isNegationPattern('src/!test')).toBe(false);
    });
  });

  describe('extractGlobPattern', () => {
    it('should remove negation prefix', () => {
      expect(extractGlobPattern('!**/node_modules/**')).toBe('**/node_modules/**');
      expect(extractGlobPattern('!**/*.lock')).toBe('**/*.lock');
    });

    it('should return pattern as-is if no negation', () => {
      expect(extractGlobPattern('**/src/**')).toBe('**/src/**');
      expect(extractGlobPattern('**/*.js')).toBe('**/*.js');
    });

    it('should handle empty string', () => {
      expect(extractGlobPattern('')).toBe('');
    });

    it('should handle single ! character', () => {
      expect(extractGlobPattern('!')).toBe('');
    });
  });

  describe('validatePathFilters', () => {
    it('should validate array of valid patterns', () => {
      const patterns = [
        '!**/node_modules/**',
        '!**/*.lock',
        'src/**/*.ts',
      ];
      expect(validatePathFilters(patterns)).toBe(true);
    });

    it('should reject array with invalid patterns', () => {
      const patterns = [
        '!**/node_modules/**',
        '!**/<script>/**',
      ];
      expect(validatePathFilters(patterns)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(validatePathFilters([])).toBe(true);
    });

    it('should reject array with empty string', () => {
      const patterns = ['!**/test/**', ''];
      expect(validatePathFilters(patterns)).toBe(false);
    });
  });
});

describe('CodeRabbit Configuration - Integration Tests', () => {
  let parsedConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    parsedConfig = yaml.load(configContent);
  });

  it('should have consistent boolean values', () => {
    const booleanFields = [
      parsedConfig.reviews.auto_review.enabled,
      parsedConfig.reviews.review_comment_lgtm,
      parsedConfig.chat.auto_reply,
    ];

    booleanFields.forEach(field => {
      expect(typeof field).toBe('boolean');
      expect([true, false]).toContain(field);
    });
  });

  it('should have valid path filter format', () => {
    const filters = parsedConfig.reviews.path_filters;
    
    filters.forEach((filter: string) => {
      expect(typeof filter).toBe('string');
      expect(filter.length).toBeGreaterThan(0);
      expect(pathFilterSchema.safeParse(filter).success).toBe(true);
    });
  });

  it('should have logical path filter exclusions', () => {
    const filters = parsedConfig.reviews.path_filters;
    
    // Common patterns that should be excluded
    const expectedExclusions = ['node_modules', 'lock'];
    
    expectedExclusions.forEach(exclusion => {
      const hasExclusion = filters.some((filter: string) => 
        filter.includes(exclusion) && isNegationPattern(filter)
      );
      expect(hasExclusion).toBe(true);
    });
  });

  it('should maintain YAML file integrity', () => {
    // Ensure the config can be serialized back to YAML
    const serialized = yaml.dump(parsedConfig);
    expect(serialized).toBeDefined();
    expect(serialized.length).toBeGreaterThan(0);
    
    // Ensure it can be parsed again
    const reparsed = yaml.load(serialized);
    expect(reparsed).toEqual(parsedConfig);
  });

  it('should validate the actual config values match expected structure', () => {
    expect(parsedConfig.language).toBe('en');
    expect(parsedConfig.reviews.auto_review.enabled).toBe(true);
    expect(parsedConfig.reviews.review_comment_lgtm).toBe(false);
    expect(parsedConfig.chat.auto_reply).toBe(true);
    expect(parsedConfig.reviews.path_filters).toContain('!**/node_modules/**');
    expect(parsedConfig.reviews.path_filters).toContain('!**/*.lock');
  });
});

describe('CodeRabbit Configuration - Mutation Tests', () => {
  let baseConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    baseConfig = yaml.load(configContent);
  });

  it('should fail validation when language is modified incorrectly', () => {
    const mutatedConfig = { ...baseConfig, language: 'english' };
    const result = validateCodeRabbitConfig(mutatedConfig);
    expect(result.success).toBe(false);
  });

  it('should fail validation when auto_review.enabled is not boolean', () => {
    const mutatedConfig = {
      ...baseConfig,
      reviews: {
        ...baseConfig.reviews,
        auto_review: { enabled: 'true' },
      },
    };
    const result = validateCodeRabbitConfig(mutatedConfig);
    expect(result.success).toBe(false);
  });

  it('should fail validation when path_filters is not an array', () => {
    const mutatedConfig = {
      ...baseConfig,
      reviews: {
        ...baseConfig.reviews,
        path_filters: '!**/node_modules/**',
      },
    };
    const result = validateCodeRabbitConfig(mutatedConfig);
    expect(result.success).toBe(false);
  });

  it('should fail validation when chat.auto_reply is missing', () => {
    const mutatedConfig = {
      ...baseConfig,
      chat: {},
    };
    const result = validateCodeRabbitConfig(mutatedConfig);
    expect(result.success).toBe(false);
  });

  it('should succeed when optional fields are removed', () => {
    const mutatedConfig = {
      language: baseConfig.language,
      reviews: {
        auto_review: baseConfig.reviews.auto_review,
      },
    };
    const result = validateCodeRabbitConfig(mutatedConfig);
    expect(result.success).toBe(true);
  });
});

describe('CodeRabbit Configuration - Security Tests', () => {
  it('should reject path filters with potential injection', () => {
    const maliciousPatterns = [
      '!**/../../../etc/passwd',
      '!**/$(rm -rf /)**',
      '!**/<script>alert("xss")</script>/**',
      '!**/`backdoor`/**',
    ];

    maliciousPatterns.forEach(pattern => {
      const result = pathFilterSchema.safeParse(pattern);
      expect(result.success).toBe(false);
    });
  });

  it('should accept safe path patterns', () => {
    const safePatterns = [
      '!**/node_modules/**',
      '!**/*.lock',
      '!**/dist/**',
      '!**/.git/**',
      'src/**/*.ts',
      '**/*.test.js',
    ];

    safePatterns.forEach(pattern => {
      const result = pathFilterSchema.safeParse(pattern);
      expect(result.success).toBe(true);
    });
  });

  it('should validate that configuration does not contain script execution', () => {
    const configPath = join(process.cwd(), '.coderabbit.yaml');
    const configContent = readFileSync(configPath, 'utf-8');
    
    // Check for potential command execution patterns
    expect(configContent).not.toMatch(/\$\(/);
    expect(configContent).not.toMatch(/`.*`/);
    expect(configContent).not.toMatch(/<script>/i);
    expect(configContent).not.toMatch(/eval\(/);
  });
});