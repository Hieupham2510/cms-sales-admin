# Page Patterns

## Purpose

This file defines the default page structure for the admin app.

## Global shell

### Sidebar
- fixed or stable width
- typical width: `w-64`
- active item uses accent treatment
- text hierarchy stays muted by default
- avoid visual noise

### Topbar
- height around `h-14`
- can include search, breadcrumbs, user menu, store switcher
- subtle border-bottom is preferred

### Page container
- use `px-6 py-6`
- page content typically uses `space-y-6`

## Standard page header

Use this structure:
- title
- short description
- action group on the right

If the page has a main CTA:
- only one primary action in the header
- secondary actions sit beside it as outline/secondary buttons

## Dashboard page

Use:
- metrics row
- trend / summary cards
- recent activity
- alerts such as low stock or pending actions

Visual priorities:
1. key numbers
2. urgent alerts
3. recent operational activity

## List page pattern

Examples:
- products list
- categories
- suppliers
- transactions

Recommended structure:
1. page header
2. filter/toolbar card or toolbar section
3. table shell
4. pagination or footer if needed

Toolbar usually contains:
- search input
- filter controls
- view options
- export/import buttons
- primary create button if relevant

## Detail/edit page pattern

Examples:
- product detail
- product edit
- supplier detail

Recommended structure:
1. page header
2. form or detail sections
3. side summary card if needed
4. sticky or clear save actions

Use cards to split logical sections:
- basic information
- pricing
- inventory
- status
- metadata

## Transaction page pattern

Examples:
- imports
- exports
- adjustments
- transaction history

Recommended structure:
1. page header
2. summary or status strip if needed
3. filters and date range
4. transaction table
5. detail dialog/drawer or dedicated detail page

## Forms

Use grid-based form layout:
- 1 column on small screens
- 2 columns on desktop
- 3 columns only when fields are short and related

Keep long text areas or complex sections full-width.

## Responsive behavior

- Maintain desktop-first admin usability
- On smaller screens, stack toolbar items and forms
- Do not over-optimize mobile at the expense of admin density on desktop