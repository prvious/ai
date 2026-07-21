# Shadcn UI Components

This application uses Shadcn UI components for consistent, accessible, and customizable UI elements.

## Component Usage

**Always use Shadcn UI components when building UI features.**

## Installation Workflow

If a required Shadcn component is not yet installed in the project:

1. Install the component using the Shadcn CLI
2. Continue with the implementation work using the newly installed component

## Examples

### Installing Components

- `pnpm dlx shadcn@latest add button`
- `pnpm dlx shadcn@latest add card`
- `pnpm dlx shadcn@latest add dialog`

## Important Notes

- Components are installed to the `resources/js/components/ui/` directory
- Shadcn components are fully customizable and use Tailwind CSS
- Always check if a component exists before installing to avoid duplicates
- Components are designed to be accessible and follow best practices
- You must NOT manually edit or create components in the `resources/js/components/ui/`
- Never attempy to manually edit,extend, or fix anything in the `resources/js/components/ui/`. the directory contains components installed from shadcnui. this is a NO GO zone.
- The components rely on base-ui implementation instead of radix-ui. so, prefer using `render={() => [element we want to render as the child]}` instead of using the `asChild` prop on the element you'd like to replace
