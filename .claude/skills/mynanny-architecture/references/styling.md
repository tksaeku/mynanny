# Styling Reference

## Table of Contents
- [System Overview](#system-overview)
- [Vite SCSS Config](#vite-scss-config)
- [Variables](#variables)
- [Mixins](#mixins)
- [MUI Theme](#mui-theme)
- [Component Styling Conventions](#component-styling-conventions)

---

## System Overview

- **Preprocessor:** SASS (modern `@use` syntax, not `@import`)
- **Naming:** BEM convention (`.block__element--modifier`)
- **File pattern:** Co-located `ComponentName.scss` next to `ComponentName.jsx`
- **Global imports:** Variables and mixins auto-injected via Vite config
- **MUI:** Material UI 5 with custom theme overrides

---

## Vite SCSS Config

From `vite.config.js`:
```js
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use 'variables' as *; @use 'mixins' as *;`,
      loadPaths: ['src/styles']
    }
  }
}
```

All SCSS files automatically have access to `$variables` and `@mixin` functions without manual imports.

---

## Variables

**File:** `src/styles/_variables.scss` (~72 lines)

### Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `$primary` | #1976d2 | Main brand, buttons, links |
| `$primary-light` | #42a5f5 | Hover states |
| `$primary-dark` | #1565c0 | Active states |
| `$secondary` | #9c27b0 | Accent |
| `$success` | #2e7d32 | Success states |
| `$warning` | #ed6c02 | Warnings |
| `$error` | #d32f2f | Errors, delete |
| `$info` | #0288d1 | Info |

### Neutral grays
`$gray-50` (#fafafa) through `$gray-900` (#212121) in standard Material increments.

### Typography
| Variable | Value |
|----------|-------|
| `$font-size-xs` | 0.75rem |
| `$font-size-sm` | 0.875rem |
| `$font-size-base` | 1rem |
| `$font-size-lg` | 1.125rem |
| `$font-size-xl` | 1.25rem |
| `$font-size-2xl` | 1.5rem |
| `$font-size-3xl` | 1.875rem |

### Spacing (base: 8px)
| Variable | Value |
|----------|-------|
| `$spacing-unit` | 8px |
| `$spacing-xs` | 4px |
| `$spacing-sm` | 8px |
| `$spacing-md` | 16px |
| `$spacing-lg` | 24px |
| `$spacing-xl` | 32px |
| `$spacing-2xl` | 48px |

### Border radius
`$radius-sm` (4px), `$radius-md` (8px), `$radius-lg` (12px), `$radius-xl` (16px)

### Shadows
`$shadow-sm`, `$shadow-md`, `$shadow-lg` — standard box-shadow values

### Breakpoints
| Variable | Value |
|----------|-------|
| `$breakpoint-xs` | 0 |
| `$breakpoint-sm` | 600px |
| `$breakpoint-md` | 900px |
| `$breakpoint-lg` | 1200px |
| `$breakpoint-xl` | 1536px |

---

## Mixins

**File:** `src/styles/_mixins.scss` (~132 lines)

### Media queries
```scss
@include mobile { ... }     // max-width: 599px
@include tablet { ... }     // 600px - 899px
@include desktop { ... }    // min-width: 900px
@include mobile-tablet { }  // max-width: 899px
```

### Flexbox shortcuts
```scss
@include flex-center;    // display:flex, justify-content:center, align-items:center
@include flex-between;   // display:flex, justify-content:space-between, align-items:center
@include flex-column;    // display:flex, flex-direction:column
```

### Typography
```scss
@include heading-1;   @include heading-2;   @include heading-3;
@include body-text;    @include small-text;
```

### Components
```scss
@include card($padding: $spacing-lg);  // background, border-radius, shadow, padding
@include button-reset;                 // strips default button styles
@include transition($props...);        // smooth transitions
@include truncate;                     // text-overflow: ellipsis
@include custom-scrollbar;             // styled scrollbar
```

---

## MUI Theme

**File:** `src/main.jsx`

```js
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none' } } }
  }
});
```

Key overrides: buttons and tabs use normal case (not UPPERCASE).

---

## Component Styling Conventions

1. **Co-location:** Each component folder contains its own `.scss` file
2. **BEM naming:** `.password-gate__form`, `.data-table__header--sortable`
3. **No global styles** beyond variables/mixins
4. **MUI override pattern:** Use `sx` prop for one-off overrides, theme for global overrides
5. **Responsive:** Use `@include mobile` / `@include desktop` mixins
6. **Spacing:** Use `$spacing-*` variables, not raw pixel values
7. **Colors:** Use `$primary`, `$error`, etc., not hex codes directly
