---
name: unit-test-creator
description: Unit test creation conventions using Vitest. Use when writing tests, creating test files, or setting up test structure. Enforces local setup (no beforeEach), co-located test files, nested describe blocks, and using 'any' type for TypeScript test errors.
---

# Unit Test Conventions

## Framework & Files
- Vitest
- Co-located: `foo.ts` → `foo.test.ts` same directory
- Extension: `.test.ts`

## Structure
- Nested `describe` blocks for grouping
- Clear, descriptive test names

```typescript
describe('calculateWeeklyPay', () => {
  describe('when given valid inputs', () => {
    it('calculates pay from hours and rate', () => {
      const hours = 40;
      const rate = 25;
      expect(calculatePay(hours, rate)).toBe(1000);
    });
  });
});
```

## Setup - CRITICAL

**NO `beforeEach` for test setup.** Each test sets up its own data locally.

```typescript
// WRONG
describe('calculatePay', () => {
  let hours: number;
  beforeEach(() => { hours = 40; });
  it('calculates', () => { ... });
});

// CORRECT
describe('calculatePay', () => {
  it('calculates correctly', () => {
    const hours = 40;
    const rate = 25;
    expect(calculatePay(hours, rate)).toBe(1000);
  });
});
```

## Mocking
- Avoid mocking whenever possible
- If required, set up mocks locally within the specific test
- Never mock setup in `beforeEach`

## TypeScript in Tests

**ALWAYS use `any` type to resolve TypeScript errors in tests.**

```typescript
const mockData: any = { ... };
const result: any = someComplexFunction();
```

## Independence
- Each test completely independent
- Tests run in any order
- No shared state
