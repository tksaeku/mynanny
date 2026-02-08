# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nanny tracking app for recording and calculating weekly pay. Password-protected React SPA with Google Sheets as the database backend.

## Features

- **Password Gate**: Simple password protection on app load
- **Tab Navigation**: Summary, Hours, Mileage, Expenses, Notes tabs (hamburger menu on mobile)
- **Summary Page**: View totals for weekly, monthly, or all-time periods with navigation arrows
- **CRUD Operations**: Add, edit, delete entries for hours, mileage, expenses, and notes
- **Configurable Rates**: Regular hourly rate, overtime rate, and mileage rate stored in Config sheet
- **Pay Calculation**: Automatically calculates total due (hours × rate + mileage reimbursement + expenses)

## Tech Stack

- **Frontend**: React 18 + Vite + Material UI + SASS
- **Database**: Google Sheets (read via Sheets API, write via Apps Script)
- **Testing**: Vitest + React Testing Library

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests in watch mode
npm run test:run # Run tests once
npm run lint     # ESLint
npm run deploy   # Build and deploy to Dreamhost
```

## Environment Variables

Create `.env` with:
```
VITE_GOOGLE_API_KEY=<Google API key with Sheets API enabled>
VITE_GOOGLE_SHEET_ID=<Google Sheet ID>
VITE_APPS_SCRIPT_URL=<Deployed Apps Script web app URL>
```

## Project Structure

```
src/
├── components/     # Reusable UI components (DataTable, EntryForm, FormDialog, etc.)
├── pages/          # Page components (SummaryPage, HoursPage, MileagePage, etc.)
├── services/       # Google Sheets API integration
└── utils/          # Date utilities, calculations
```

## Google Sheets Structure

The app expects these sheet tabs:
- **Hours**: Date, DayOfMonth, RegularHours, OvertimeHours, TotalHours
- **Mileage**: Date, Miles, Purpose
- **Expenses**: Date, Amount, Category, Description
- **Notes**: Date, Category, Note
- **Config**: Key-value pairs for rates (Regular Hourly Rate, Overtime Rate, Mileage Rate)

## Architecture Consultation Rule

**CRITICAL**: Before making ANY code changes, adding features, fixing bugs, refactoring, writing tests, or researching the codebase, you MUST first consult the `mynanny-architecture` skill. This skill contains the complete application architecture, data flow, component hierarchy, service layer design, and coding conventions. Read the relevant reference files from `.claude/skills/mynanny-architecture/references/` based on what you're working on:
- Modifying components → read `references/components.md`
- Changing services or backend → read `references/services-and-backend.md`
- Working with calculations or dates → read `references/utils-and-calculations.md`
- Modifying pages → read `references/pages.md`
- Styling changes → read `references/styling.md`

## Skills

See `.claude/skills/` for detailed conventions:
- `mynanny-architecture/` - **Complete application architecture** (MUST consult before any changes)
- `js-conventions/` - JavaScript/TypeScript coding standards
- `unit-test-creator/` - Unit testing conventions (Vitest)

## Skill Creation Rule

**IMPORTANT**: When creating or updating any skill, ALWAYS use the `skill-creator` skill first. Invoke it with `/skill-creator` before writing any skill content. This ensures all skills follow the proper SKILL.md format with YAML frontmatter.
