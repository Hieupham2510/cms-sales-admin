# Implementation Rules

## Purpose

This file defines how to apply the design system in generated code.

## Core implementation policy

- Prefer existing shared components before creating new ones.
- If the repository already has app-specific wrappers like `AppButton`, `PageHeader`, or `AppCard`, reuse them.
- If not, compose from shadcn/ui primitives while preserving semantic tokens.

## Styling rules

- Prefer semantic utility classes:
  - `bg-background`
  - `text-foreground`
  - `bg-card`
  - `text-card-foreground`
  - `text-muted-foreground`
  - `border-border`
  - `ring-ring`

- Avoid raw color classes in business UI unless required for a one-off case not covered by tokens.

## Component creation rules

When adding a new UI element:
1. Check if an existing component can be reused.
2. If not, build from shadcn/ui primitives.
3. Apply design-system spacing, radius, and semantic tokens.
4. Keep APIs small and descriptive.
5. Avoid over-abstraction.

## Layout rules

- Use shared page patterns for page shells, cards, and sections.
- Keep toolbar structure predictable.
- Preserve content density across tables and forms.

## Code quality rules

- Keep code production-ready.
- Keep names domain-specific and readable.
- Avoid inline anonymous styling decisions when a reusable class or component is more appropriate.
- Keep business logic and presentation separated when possible.

## Review checklist

Before finalizing UI code:
- Does it use semantic tokens?
- Does the action hierarchy make sense?
- Does the spacing match the admin density?
- Does it look like a CMS/admin page, not a landing page?
- Does it reuse existing components where possible?
- Does it follow inventory-specific status semantics if relevant?