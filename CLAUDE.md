# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nanny tracking app for recording and calculating weekly pay. Tracks:
- Date and hours worked
- Mileage
- Miscellaneous expenses
- Notes

Configurable pay rate per hour and mileage rate. Outputs weekly pay totals (hours × rate + mileage + expenses).

## Tech Stack

To be determined - this is a new project.

## Skills

See `.claude/skills/` for detailed conventions:
- `js-conventions/` - JavaScript/TypeScript coding standards
- `unit-test-creator/` - Unit testing conventions (Vitest)

## Skill Creation Rule

**IMPORTANT**: When creating or updating any skill, ALWAYS use the `skill-creator` skill first. Invoke it with `/skill-creator` before writing any skill content. This ensures all skills follow the proper SKILL.md format with YAML frontmatter.
