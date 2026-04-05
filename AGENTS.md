# CMS Sales Admin Agent Rules

This repository uses a strict admin design system.

For any request involving UI, pages, buttons, forms, tables, dialogs, badges, filters, or layout, you must first use these files as the source of truth:

- `admin-ui-system/references/design-system.md`
- `admin-ui-system/references/component-rules.md`
- `admin-ui-system/references/page-patterns.md`
- `admin-ui-system/references/inventory-domain-rules.md`
- `admin-ui-system/references/implementation-rules.md`

Required behavior:
- Do not answer from generic UI knowledge alone if the request is about project UI.
- Base all styling and component decisions on the files above.
- Prefer existing project components before creating new ones.
- Use `src/components/ui/button.tsx` for buttons unless a project-specific wrapper exists.
- Do not hardcode random Tailwind colors such as `text-blue-600`, `bg-slate-50`, `border-gray-200` in business components.
- Use semantic tokens and project conventions.
- For action hierarchy:
  - create/save/confirm = primary
  - export/import/filter/refresh = secondary or outline
  - delete/remove = destructive
  - row actions = ghost or icon-only button
- Keep UI medium-compact and admin-oriented. Do not style pages like a landing page.

When the user asks a conceptual UI question such as “you will base this button on what?”, answer using the project rule files above, not generic design advice.y