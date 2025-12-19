# Test Suite Documentation

## Overview
This test suite provides comprehensive validation for the `.coderabbit.yaml` configuration file.

## Test Structure

### Configuration Tests (`tests/config/`)
- **coderabbit.schema.ts**: Zod schema definitions for validating CodeRabbit configuration
- **coderabbit.test.ts**: Comprehensive test suite covering:
  - File existence and YAML syntax validation
  - Schema compliance
  - Language configuration
  - Review settings (auto_review, path_filters, review_comment_lgtm)
  - Chat configuration
  - Configuration integrity
  - Edge cases and error handling
  - Best practices
  - Security considerations
  - API compatibility

## Running Tests

```bash
# Install test dependencies
npm install --save-dev vitest yaml @types/node

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test tests/config/coderabbit.test.ts
```

## Test Coverage

The test suite includes:
- ✅ 40+ test cases
- ✅ YAML syntax validation
- ✅ Schema validation with Zod
- ✅ Path filter pattern validation
- ✅ Security checks
- ✅ Best practices validation
- ✅ Edge case handling
- ✅ API compatibility verification

## Adding New Tests

When adding new configuration options to `.coderabbit.yaml`:

1. Update the schema in `tests/config/coderabbit.schema.ts`
2. Add corresponding test cases in `tests/config/coderabbit.test.ts`
3. Run tests to ensure everything passes
4. Update this README if needed

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run configuration tests
  run: npm test
```
