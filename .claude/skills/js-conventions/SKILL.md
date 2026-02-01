---
name: js-conventions
description: JavaScript and TypeScript coding conventions. Use when writing any JS/TS code, creating functions, defining variables, handling async operations, or structuring exports. Enforces const-by-default, functional patterns, explicit types, and DRY principles.
---

# JS/TS Conventions

## Variables
- `const` by default; `let` only when reassigning
- Never `var`

## Functions
- Regular `function` for named/exported functions
- Arrow functions for callbacks

```typescript
function calculatePay(hours: number, rate: number): number {
  return hours * rate;
}

items.map((item) => item.value);
```

## Formatting
- Single quotes, semicolons
- Template literals for interpolation

## Async
- `async/await` over `.then()` chains

## Patterns
- `map`/`filter`/`reduce` over imperative loops
- Immutable data; create new objects/arrays

## TypeScript
- Explicit return types on all functions

## Exports
- Inline exports at declaration
- Exception: React components use `export default ComponentName` at end

```typescript
export function calculateTotal(): number { ... }
export const TAX_RATE = 0.08;

// Component files
function MyComponent() { ... }
export default MyComponent;
```

## Constants
- String literals and magic numbers go in a shared `constants.ts`
- ALL_CAPS naming

```typescript
export const DEFAULT_HOURLY_RATE = 25;
export const MILEAGE_RATE = 0.67;
```

## DRY
- Code repeated >2 times: extract to reusable function
- All meaningful logic requires unit tests
