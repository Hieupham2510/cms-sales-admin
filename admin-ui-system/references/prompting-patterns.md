# Prompting Patterns

## Purpose

This file helps interpret common user requests into the correct UI treatment.

## Example: "Create a button to export Excel"

Interpretation:
- This is a utility toolbar action.
- It is not the primary page CTA unless explicitly stated otherwise.

Default treatment:
- outline or secondary button
- same height as other toolbar controls
- medium emphasis
- icon allowed if useful
- should align with filters/import/refresh actions

Do not:
- style it as a destructive button
- style it stronger than create/save
- invent a new palette outside the design system

## Example: "Create a button to add new product"

Interpretation:
- This is likely the primary page CTA on product listing pages.

Default treatment:
- primary button
- placed in page header or toolbar action area
- may include plus icon

## Example: "Create product status badge"

Interpretation:
- non-interactive semantic indicator
- should map to inventory status rules

Default treatment:
- active → success badge
- low stock → low-stock badge
- out of stock → out-of-stock badge
- inactive → inactive badge

## Example: "Build product list page"

Interpretation:
- use list page pattern
- include header, toolbar, table shell, status badges, stock column, actions column

## Example: "Build product edit page"

Interpretation:
- use detail/edit page pattern
- include sectioned form cards
- save action should be primary
- destructive actions should remain separated

## Example: "Add filters for transaction history"

Interpretation:
- these are support controls
- keep them in toolbar/filter area
- use inputs/selects/date pickers with consistent density