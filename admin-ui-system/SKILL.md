---
name: admin-ui-system
description: apply a consistent admin dashboard design system for next.js, shadcn/ui, and tailwind css projects. use when generating, editing, or reviewing ui code for cms, inventory, sales-admin, dashboard, table, form, modal, drawer, toolbar, or page layout components. use when chatgpt must choose colors, typography, spacing, radius, button variants, status badges, or page structure so the output matches a premium b2b saas admin style and existing project conventions.
---

# Admin UI System

Use this skill to generate or modify UI for a Next.js admin/CMS project that uses shadcn/ui and Tailwind CSS.

## Core behavior

- Treat the project as a premium B2B SaaS admin dashboard.
- Prefer semantic design tokens over hard-coded Tailwind colors.
- Prefer existing shared components and existing patterns before creating new primitives.
- Keep layout calm, compact, readable, and enterprise-oriented.
- Use Geist Sans and Geist Mono when typography choices are relevant.
- Use medium-compact density suitable for tables, forms, filters, toolbars, and transactional pages.

## Mandatory implementation rules

- Never introduce random color utilities like `text-blue-600`, `bg-slate-50`, or `border-gray-200` in business components if semantic tokens already cover the case.
- Prefer `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, and `ring-ring`.
- Treat one action as the visual primary action per toolbar or page header.
- Treat export, import, filter, refresh, and download actions as utility actions unless the user explicitly says they must be primary.
- Use inventory status semantics consistently across tables, forms, and detail pages.
- Do not make admin pages look like a landing page.
- Prefer subtle hierarchy through spacing, borders, typography, and muted surfaces rather than strong gradients or heavy shadows.

## Workflow

1. Read `references/design-system.md` for theme and visual rules.
2. Read `references/component-rules.md` before creating or modifying components.
3. Read `references/page-patterns.md` when the task affects a page or layout.
4. Read `references/inventory-domain-rules.md` when the task involves products, stock, transactions, import/export, or inventory states.
5. Read `references/implementation-rules.md` before writing final code.
6. If the task is a small UI request like “add export excel button”, still apply the full semantic hierarchy and reuse existing examples from `assets/examples/`.

## Decision rules for actions

- Primary page CTA:
  - use primary button styling
  - reserve for create/save/confirm actions
- Secondary utility toolbar action:
  - use outline or secondary styling
  - typical examples: export excel, import file, refresh, bulk actions
- Destructive action:
  - use destructive styling
- Inline row action:
  - use ghost or icon button
- Status-only element:
  - use badges, not buttons

## Output expectations

When generating code:
- keep code production-ready
- keep styling aligned with project tokens
- keep component APIs simple
- avoid unnecessary abstraction
- reuse shadcn/ui primitives where possible
- follow existing naming conventions in the repo if available

## References

- Design system: `references/design-system.md`
- Component rules: `references/component-rules.md`
- Page patterns: `references/page-patterns.md`
- Inventory domain rules: `references/inventory-domain-rules.md`
- Implementation rules: `references/implementation-rules.md`
- Prompt interpretation patterns: `references/prompting-patterns.md`

## Examples

Check `assets/examples/` for reusable component patterns before inventing new structures.