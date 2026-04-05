# Component Rules

## Purpose

This file defines how common admin components should look and behave.

## Buttons

### Primary button
Use for:
- create
- save
- confirm
- submit
- primary page action

Style guidance:
- use semantic primary token
- medium emphasis
- default height aligned with other controls
- do not use for utility actions by default

### Secondary / outline button
Use for:
- export excel
- import file
- refresh
- open filters
- non-destructive supporting actions

Style guidance:
- use outline or secondary treatment
- should not visually compete with primary CTA

### Ghost button
Use for:
- icon-only toolbar actions
- row-level actions
- low-emphasis toggles
- tertiary actions inside dense UI

### Destructive button
Use for:
- delete
- remove
- irreversible actions

## Inputs

- Use standard control height around 40px
- Use semantic input and ring tokens
- Use muted placeholder text
- Labels should be concise and readable
- Keep spacing between label and input at `space-y-2`

## Selects

- Same visual rhythm as inputs
- Match height and radius of inputs
- Use for category, supplier, status, or filter selection

## Badges

Use badges for:
- status
- stock condition
- transaction type
- non-interactive semantic indicators

Do not use badges as buttons.

### Status badge mapping
- active → success style
- low stock → low-stock style
- out of stock → out-of-stock style
- inactive → inactive style
- informational transaction state → info style
- warning condition → warning style

## Cards

- Use `bg-card text-card-foreground border border-border rounded-xl`
- Card padding usually `p-5`
- Header and content can be separated by border when needed
- Use cards to group sections, forms, metrics, and table containers

## Tables

- Tables are a first-class pattern in the product
- Prioritize scanability and consistent row rhythm
- Header text should be smaller and muted
- Row hover should be subtle
- Status cells should use badges
- Numeric values should use tabular alignment when useful

### Density
- header height around 44px
- row height around 48px
- use compact but breathable spacing

## Tabs

Use for:
- switching between related views
- toggling product subviews
- segmented content in detail pages

Keep tabs understated and functional.

## Dialogs and drawers

Use dialog for:
- short confirm flows
- focused edits
- lightweight create/edit flows

Use drawer or full page for:
- longer forms
- multi-section product editing
- workflows with many fields

## Dropdown menus

Use for:
- row actions
- small grouped utility actions
- overflow actions

## Empty states

Should include:
- icon
- concise title
- short explanation
- one main CTA if appropriate

Tone:
- helpful
- not playful
- operational

## Loading states

Prefer:
- skeletons for cards/tables/forms
- subtle progress indicators
- avoid flashy spinners as the only loading treatment