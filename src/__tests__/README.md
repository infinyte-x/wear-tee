# Test Suite for wear-tee

This directory contains the test suite for the wear-tee project.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### CodeRabbit Configuration Tests (`coderabbit-config.test.ts`)

Comprehensive tests for the `.coderabbit.yaml` configuration file:

- **YAML Parsing**: Validates that the YAML file is properly formatted and parseable
- **Schema Validation**: Ensures all configuration values match expected types and constraints
- **Language Field**: Tests ISO 639-1 language code validation
- **Path Filters**: Validates glob patterns and negation syntax
- **Auto Review**: Tests boolean configuration values
- **Review Comments**: Validates LGTM comment settings
- **Chat Settings**: Tests auto-reply configuration
- **Edge Cases**: Handles null, undefined, and malformed inputs
- **Helper Functions**: Tests utility functions for pattern matching
- **Integration Tests**: Validates the complete configuration structure
- **Mutation Tests**: Ensures validation catches configuration errors
- **Security Tests**: Prevents injection attacks in path filters

## Testing Philosophy

- **Comprehensive Coverage**: Tests cover happy paths, edge cases, and failure conditions
- **Type Safety**: Leverages Zod schemas for runtime type validation
- **Security**: Validates against potential injection attacks
- **Maintainability**: Clear test names and structure for easy understanding
- **Integration**: Tests validate the actual configuration file in use

## Adding New Tests

When adding new tests:

1. Follow the existing naming convention: `[feature].test.ts`
2. Use descriptive test names that explain what is being tested
3. Group related tests using `describe` blocks
4. Include edge cases and error conditions
5. Mock external dependencies appropriately
6. Update this README with new test descriptions

## Dependencies

- **Vitest**: Fast unit test framework for Vite projects
- **js-yaml**: YAML parser for reading configuration files
- **Zod**: TypeScript-first schema validation library