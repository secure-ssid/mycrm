# MyCRM Testing Guide

Comprehensive testing documentation for the MyCRM application.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# View coverage
npm run test:coverage

# Interactive test UI
npm run test:ui
npm run test:e2e:ui
```

## Testing Strategy

This guide covers unit testing, integration testing, end-to-end testing, performance testing, and accessibility testing for MyCRM.

- **Unit Tests**: Test individual functions and utilities
- **Integration Tests**: Test API routes and database operations
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Measure query and API response times
- **Accessibility Tests**: Ensure WCAG 2.1 AA compliance

## Test Categories

### 1. Unit Tests (`__tests__/unit/`)

Test individual functions and utilities in isolation.

**Examples:**
- Type constants validation
- Authentication utility functions
- Date formatting helpers
- Zod schema validation

### 2. Integration Tests (`__tests__/integration/`)

Test API routes, database operations, and component interactions.

**Examples:**
- Customer CRUD API endpoints
- Prisma database operations
- Authentication flow
- Cascade deletes

### 3. End-to-End Tests (`__tests__/e2e/`)

Test complete user workflows using Playwright.

**Examples:**
- Login/logout flows
- Customer creation workflow
- Customer → Site → Contact → Meeting pipeline
- Navigation and routing

### 4. Performance Tests (`__tests__/performance/`)

Measure and enforce performance benchmarks.

**Benchmarks:**
- Dashboard load: < 2 seconds (100 customers)
- Reports aggregation: < 1 second
- API response: < 500ms
- Search queries: < 200ms

### 5. Accessibility Tests (`__tests__/accessibility/`)

Ensure WCAG 2.1 AA compliance.

**Coverage:**
- Form labels and ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast (light and dark mode)
- Heading hierarchy

## Browser Compatibility

### Desktop Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

### Mobile Browsers
- iOS Safari (latest)
- Android Chrome (latest)

### Dark Mode
All tests validate light and dark mode rendering.

## Performance Benchmarks

| Metric | Target | Critical |
|--------|--------|----------|
| Dashboard Load (100 customers) | < 2s | < 3s |
| Reports Aggregation | < 1s | < 1.5s |
| API Response (GET) | < 500ms | < 1s |
| Search Query | < 200ms | < 500ms |

## Accessibility Standards

- WCAG 2.1 Level AA compliance
- Color contrast 4.5:1 for text
- Keyboard navigable
- Screen reader compatible
- Proper heading hierarchy

## Debugging Tests

### Unit/Integration Tests

```bash
# Debug mode
npm run test -- --debug

# Watch mode
npm run test -- --watch

# UI mode
npm run test:ui
```

### E2E Tests

```bash
# Debug mode (opens browser)
npm run test:e2e:debug

# View UI
npm run test:e2e:ui
```

## Test Files to Create

Implementation sequence:

### Phase 1: Setup
- [ ] Create `vitest.config.ts`
- [ ] Create `playwright.config.ts`
- [ ] Create test utilities in `test-utils/`

### Phase 2: Unit Tests
- [ ] `__tests__/unit/lib/types.test.ts`
- [ ] `__tests__/unit/lib/auth-utils.test.ts`
- [ ] `__tests__/unit/utils/validation.test.ts`

### Phase 3: Integration Tests
- [ ] `__tests__/integration/api/customers.test.ts`
- [ ] `__tests__/integration/api/auth.test.ts`
- [ ] `__tests__/integration/database/customer-operations.test.ts`

### Phase 4: E2E Tests
- [ ] `__tests__/e2e/auth/login.spec.ts`
- [ ] `__tests__/e2e/workflows/customer-lifecycle.spec.ts`
- [ ] `__tests__/e2e/navigation/sidebar-navigation.spec.ts`

### Phase 5: Performance & Accessibility
- [ ] `__tests__/performance/dashboard-load.test.ts`
- [ ] `__tests__/accessibility/forms.test.ts`
- [ ] `__tests__/accessibility/navigation.test.ts`

## Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

### Integration Tests
- Reset database before each test
- Test happy path and error cases
- Verify database state
- Test cascade deletes

### E2E Tests
- Use stable selectors (roles, labels)
- Test critical user journeys
- Handle authentication once
- Avoid hard-coded waits

### Performance Tests
- Use consistent test data
- Run in isolation
- Set realistic thresholds
- Monitor trends

## Key Issues to Address

### Critical (Must Fix)
1. **Add authentication to all API routes** - Protect `/api/*` endpoints
2. **Add data ownership filtering** - Add `userId` to CRM entities
3. **Fix schema mismatches** - Align API field names with Prisma schema
4. **Add input validation** - Create Zod schemas

### Important (Should Fix)
1. **Add error boundaries** - Graceful error UI
2. **Use type constants** - Validate enum values
3. **Fix inconsistent status values** - TaskStatus consistency
4. **Add error handling** - Try-catch blocks in APIs

## Coverage Requirements

Minimum coverage targets:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

```bash
npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
