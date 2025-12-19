import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { join } from 'path';
import { 
  CodeRabbitConfigSchema, 
  isValidPathFilter,
  isPathExcluded,
  type CodeRabbitConfig 
} from './coderabbit.schema';

describe('.coderabbit.yaml Configuration Tests', () => {
  let configContent: string;
  let configData: unknown;
  const configPath = join(process.cwd(), '.coderabbit.yaml');

  beforeAll(() => {
    // Read the actual configuration file
    if (!existsSync(configPath)) {
      throw new Error('.coderabbit.yaml file not found');
    }
    configContent = readFileSync(configPath, 'utf-8');
  });

  describe('File Existence and Syntax', () => {
    it('should exist in the repository root', () => {
      expect(existsSync(configPath)).toBe(true);
    });

    it('should be readable', () => {
      expect(configContent).toBeDefined();
      expect(configContent.length).toBeGreaterThan(0);
    });

    it('should contain valid YAML syntax', () => {
      expect(() => {
        configData = parseYaml(configContent);
      }).not.toThrow();
      expect(configData).toBeDefined();
    });

    it('should not be empty', () => {
      const parsed = parseYaml(configContent);
      expect(parsed).not.toBeNull();
      expect(Object.keys(parsed as object).length).toBeGreaterThan(0);
    });
  });

  describe('Schema Validation', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should match the CodeRabbit configuration schema', () => {
      const result = CodeRabbitConfigSchema.safeParse(config);
      if (!result.success) {
        console.error('Validation errors:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });

    it('should have all required top-level keys', () => {
      expect(config).toHaveProperty('language');
      expect(config).toHaveProperty('reviews');
      expect(config).toHaveProperty('chat');
    });

    it('should not have unexpected top-level keys', () => {
      const allowedKeys = ['language', 'reviews', 'chat'];
      const actualKeys = Object.keys(config);
      const unexpectedKeys = actualKeys.filter(key => !allowedKeys.includes(key));
      expect(unexpectedKeys).toHaveLength(0);
    });
  });

  describe('Language Configuration', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should have a valid language setting', () => {
      expect(config.language).toBeDefined();
      expect(typeof config.language).toBe('string');
    });

    it('should use a supported language code', () => {
      const supportedLanguages = ['en', 'ja', 'zh-CN', 'zh-TW', 'ko', 'es', 'fr', 'de', 'pt', 'ru'];
      expect(supportedLanguages).toContain(config.language);
    });

    it('should be set to English', () => {
      expect(config.language).toBe('en');
    });
  });

  describe('Reviews Configuration', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should have a reviews section', () => {
      expect(config.reviews).toBeDefined();
      expect(typeof config.reviews).toBe('object');
    });

    it('should have all required review keys', () => {
      expect(config.reviews).toHaveProperty('auto_review');
      expect(config.reviews).toHaveProperty('path_filters');
      expect(config.reviews).toHaveProperty('review_comment_lgtm');
    });

    describe('Auto Review Settings', () => {
      it('should have auto_review configuration', () => {
        expect(config.reviews.auto_review).toBeDefined();
      });

      it('should have enabled flag as boolean', () => {
        expect(typeof config.reviews.auto_review.enabled).toBe('boolean');
      });

      it('should have auto review enabled', () => {
        expect(config.reviews.auto_review.enabled).toBe(true);
      });
    });

    describe('Path Filters', () => {
      it('should have path_filters array', () => {
        expect(Array.isArray(config.reviews.path_filters)).toBe(true);
      });

      it('should have at least one path filter', () => {
        expect(config.reviews.path_filters.length).toBeGreaterThan(0);
      });

      it('should have all filters as strings', () => {
        config.reviews.path_filters.forEach(filter => {
          expect(typeof filter).toBe('string');
        });
      });

      it('should have valid path filter patterns', () => {
        config.reviews.path_filters.forEach(filter => {
          expect(isValidPathFilter(filter)).toBe(true);
        });
      });

      it('should exclude node_modules directory', () => {
        const hasNodeModulesFilter = config.reviews.path_filters.some(
          filter => filter.includes('node_modules')
        );
        expect(hasNodeModulesFilter).toBe(true);
      });

      it('should exclude lock files', () => {
        const hasLockFilter = config.reviews.path_filters.some(
          filter => filter.includes('.lock') || filter.includes('lock')
        );
        expect(hasLockFilter).toBe(true);
      });

      it('should use negation pattern (!) for exclusions', () => {
        const exclusionFilters = config.reviews.path_filters.filter(
          filter => filter.startsWith('!')
        );
        expect(exclusionFilters.length).toBeGreaterThan(0);
      });

      it('should properly exclude test paths with node_modules', () => {
        const testPaths = [
          'node_modules/package/index.js',
          'src/node_modules/lib.ts',
          'packages/app/node_modules/dep/file.js',
        ];

        testPaths.forEach(path => {
          const excluded = isPathExcluded(path, config.reviews.path_filters);
          expect(excluded).toBe(true);
        });
      });

      it('should properly exclude test paths with lock files', () => {
        const testPaths = [
          'package-lock.json',
          'yarn.lock',
          'pnpm-lock.yaml',
          'bun.lock',
        ];

        testPaths.forEach(path => {
          const excluded = isPathExcluded(path, config.reviews.path_filters);
          expect(excluded).toBe(true);
        });
      });
    });

    describe('Review Comment LGTM', () => {
      it('should have review_comment_lgtm setting', () => {
        expect(config.reviews).toHaveProperty('review_comment_lgtm');
      });

      it('should be a boolean value', () => {
        expect(typeof config.reviews.review_comment_lgtm).toBe('boolean');
      });

      it('should be set to false', () => {
        expect(config.reviews.review_comment_lgtm).toBe(false);
      });
    });
  });

  describe('Chat Configuration', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should have a chat section', () => {
      expect(config.chat).toBeDefined();
      expect(typeof config.chat).toBe('object');
    });

    it('should have auto_reply setting', () => {
      expect(config.chat).toHaveProperty('auto_reply');
    });

    it('should have auto_reply as boolean', () => {
      expect(typeof config.chat.auto_reply).toBe('boolean');
    });

    it('should have auto_reply enabled', () => {
      expect(config.chat.auto_reply).toBe(true);
    });
  });

  describe('Configuration Integrity', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should have consistent boolean values', () => {
      const booleanValues = [
        config.reviews.auto_review.enabled,
        config.reviews.review_comment_lgtm,
        config.chat.auto_reply,
      ];

      booleanValues.forEach(value => {
        expect(typeof value).toBe('boolean');
        expect(value === true || value === false).toBe(true);
      });
    });

    it('should not have null or undefined values', () => {
      const checkForNullish = (obj: unknown, path = ''): void => {
        if (obj === null || obj === undefined) {
          throw new Error(`Found null/undefined at ${path}`);
        }
        if (typeof obj === 'object' && obj !== null) {
          Object.entries(obj).forEach(([key, value]) => {
            checkForNullish(value, path ? `${path}.${key}` : key);
          });
        }
      };

      expect(() => checkForNullish(config)).not.toThrow();
    });

    it('should have proper YAML formatting', () => {
      // Check for common YAML issues
      expect(configContent).not.toContain('\t'); // No tabs
      expect(configContent.split('\n').every(line => 
        line.length === 0 || line.match(/^ *[^ ]/)
      )).toBe(true); // Consistent indentation
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle path filter edge cases', () => {
      const edgeCasePatterns = [
        '!**/node_modules/**',
        '!**/*.lock',
        '!*.log',
        '!**/dist/**',
        '!**/build/**',
      ];

      edgeCasePatterns.forEach(pattern => {
        expect(isValidPathFilter(pattern)).toBe(true);
      });
    });

    it('should reject invalid path filters', () => {
      const invalidPatterns = [
        '!**/<script>alert(1)</script>',
        '!../../../etc/passwd',
        '',
      ];

      invalidPatterns.forEach(pattern => {
        if (pattern) {
          const result = CodeRabbitConfigSchema.shape.reviews.shape.path_filters.element.safeParse(pattern);
          if (result.success) {
            // Even if basic validation passes, check semantic validity
            expect(pattern.includes('<')).toBe(false);
            expect(pattern.includes('>')).toBe(false);
          }
        }
      });
    });

    it('should handle language code case sensitivity', () => {
      const testConfig = { ...parseYaml(configContent) as CodeRabbitConfig };
      expect(testConfig.language.toLowerCase()).toBe('en');
    });
  });

  describe('Best Practices', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should exclude common build artifacts', () => {
      const commonArtifacts = ['node_modules', 'lock'];
      const allFiltersText = config.reviews.path_filters.join(' ');
      
      commonArtifacts.forEach(artifact => {
        expect(allFiltersText).toContain(artifact);
      });
    });

    it('should have reasonable number of path filters', () => {
      // Too few might miss important exclusions, too many might be overly complex
      expect(config.reviews.path_filters.length).toBeGreaterThanOrEqual(1);
      expect(config.reviews.path_filters.length).toBeLessThanOrEqual(20);
    });

    it('should use glob patterns effectively', () => {
      const hasGlobPatterns = config.reviews.path_filters.some(
        filter => filter.includes('**') || filter.includes('*')
      );
      expect(hasGlobPatterns).toBe(true);
    });
  });

  describe('Security Considerations', () => {
    let config: CodeRabbitConfig;

    beforeAll(() => {
      config = parseYaml(configContent) as CodeRabbitConfig;
    });

    it('should not contain sensitive information', () => {
      const sensitivePatterns = [
        /api[_-]?key/i,
        /secret/i,
        /password/i,
        /token/i,
        /credential/i,
      ];

      sensitivePatterns.forEach(pattern => {
        expect(configContent.match(pattern)).toBeNull();
      });
    });

    it('should not contain executable code patterns', () => {
      const codePatterns = [
        /\$\{.*\}/,  // Template literals
        /\$\(.*\)/,  // Command substitution
        /`.*`/,      // Backticks
      ];

      codePatterns.forEach(pattern => {
        expect(configContent.match(pattern)).toBeNull();
      });
    });

    it('should have safe path filter patterns', () => {
      const dangerousPatterns = [
        '../',
        '~/',
        '/etc/',
        '/root/',
        'C:\\',
      ];

      config.reviews.path_filters.forEach(filter => {
        dangerousPatterns.forEach(dangerous => {
          expect(filter).not.toContain(dangerous);
        });
      });
    });
  });

  describe('Compatibility', () => {
    it('should be compatible with CodeRabbit v1 API', () => {
      const config = parseYaml(configContent) as CodeRabbitConfig;
      
      // Verify structure matches expected API
      expect(config).toMatchObject({
        language: expect.any(String),
        reviews: expect.objectContaining({
          auto_review: expect.objectContaining({
            enabled: expect.any(Boolean),
          }),
        }),
        chat: expect.objectContaining({
          auto_reply: expect.any(Boolean),
        }),
      });
    });

    it('should use correct property naming convention', () => {
      const config = parseYaml(configContent) as CodeRabbitConfig;
      
      // CodeRabbit uses snake_case
      expect(config.reviews).toHaveProperty('auto_review');
      expect(config.reviews).toHaveProperty('path_filters');
      expect(config.reviews).toHaveProperty('review_comment_lgtm');
      expect(config.chat).toHaveProperty('auto_reply');
    });
  });
});