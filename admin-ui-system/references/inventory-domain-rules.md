# Inventory Domain Rules

## Purpose

This file defines inventory-specific UI semantics and conventions.

## Product status

### Active
Meaning:
- product is available for use or sale

UI treatment:
- success badge
- normal text emphasis
- no warning styling

### Low stock
Meaning:
- stock is above zero but below configured threshold

UI treatment:
- low-stock badge
- warning-level emphasis in summary cards or alerts
- should be visible in product list and detail views

### Out of stock
Meaning:
- stock is zero

UI treatment:
- out-of-stock badge
- stronger negative emphasis than low stock
- may surface in dashboard alerts

### Inactive
Meaning:
- product is not currently used or sold

UI treatment:
- inactive badge
- visually quieter than destructive or warning states

## Stock quantity display

- Use tabular numbers
- Keep quantity easy to scan in tables
- If quantity is critical, combine numeric value with semantic color or badge
- Do not rely on color alone to communicate stock state

## Transaction types

### Import
Meaning:
- stock enters inventory

UI treatment:
- success or info semantic
- icon can suggest incoming movement

### Export
Meaning:
- stock leaves inventory

UI treatment:
- warning or info depending on context
- for operational history, keep treatment distinct but not alarming unless it is an error

### Adjustment
Meaning:
- stock changed due to correction, recount, or reconciliation

UI treatment:
- muted or warning/info depending on context
- keep separate from import/export semantics

## Toolbar action semantics

### Create product
- primary action on product list page

### Export Excel
- secondary utility action
- typically outline or secondary button
- should never visually dominate create/save

### Import file
- utility action unless the page is specifically centered around import workflow

### Save changes
- primary action on edit page

### Delete product
- destructive action

## Inventory alerts

Low stock alert cards should:
- use calm warning styling
- remain readable in a dashboard context
- not look like system failure banners

Out-of-stock alert cards should:
- have higher contrast than low stock alerts
- remain consistent with the system’s semantic tokens

## Tables

Recommended key columns on inventory-heavy tables:
- product name
- sku
- category
- stock
- status
- price
- updated at
- actions

Use badges for status and tabular numbers for stock and price.

## Product detail pages

Prefer sections for:
- basic info
- commercial info
- inventory info
- operational history
- metadata

Keep inventory and status visible without scrolling too far.