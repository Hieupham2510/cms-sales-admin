# Design System

## Purpose

This reference defines the visual foundation for the admin dashboard UI.

## Brand direction

- premium B2B SaaS admin
- calm
- neutral
- readable
- structured
- enterprise-ready
- medium-compact density

## Typography

### Fonts
- Primary UI font: Geist Sans
- Monospace font: Geist Mono

### Typography roles
- Page title: `text-2xl font-semibold tracking-tight`
- Section title: `text-lg font-semibold tracking-tight`
- Card title: `text-base font-semibold`
- Body text: `text-sm leading-6`
- Small text: `text-sm text-muted-foreground`
- Caption: `text-xs text-muted-foreground`
- Table text: `text-sm`
- Metric values: `text-2xl font-semibold tracking-tight tabular-nums`
- SKU/barcode/IDs: `font-mono text-xs text-muted-foreground`

## Color model

Use semantic tokens, not raw palette classes.

### Core tokens
- `background`
- `foreground`
- `card`
- `card-foreground`
- `popover`
- `popover-foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `muted`
- `muted-foreground`
- `accent`
- `accent-foreground`
- `destructive`
- `destructive-foreground`
- `border`
- `input`
- `ring`

### Inventory semantic tokens
- `success`
- `success-foreground`
- `warning`
- `warning-foreground`
- `info`
- `info-foreground`
- `low-stock`
- `low-stock-foreground`
- `out-of-stock`
- `out-of-stock-foreground`
- `inactive`
- `inactive-foreground`

## Spacing system

Use a 4px-based scale with common operational steps:

- `2` = 8px
- `3` = 12px
- `4` = 16px
- `5` = 20px
- `6` = 24px
- `8` = 32px
- `10` = 40px
- `12` = 48px

### Default spacing choices
- Page padding: `px-6 py-6`
- Section gap: `space-y-6`
- Card content padding: `p-5`
- Card header padding: `px-5 py-4`
- Toolbar gap: `gap-2` or `gap-3`
- Form field gap: `space-y-2`
- Form section gap: `space-y-5`
- Grid gap: `gap-4`

## Radius

- Base radius token: `--radius: 0.75rem`
- Use:
  - `rounded-lg` for most controls
  - `rounded-xl` for cards, dialogs, table shells
  - avoid overly rounded consumer-style UI

## Borders

- Use borders as the primary layering mechanism
- Prefer `border-border`
- Use clean 1px borders
- Avoid stacked borders and unnecessary dividers

## Shadow

- Keep shadows subtle
- Cards: light shadow only
- Dialogs/popovers/dropdowns: moderate shadow
- Do not rely on shadow for hierarchy when border and spacing are sufficient

## Density

Optimize for productivity:
- medium-compact admin density
- high readability
- enough whitespace for forms and tables
- not sparse like a marketing site