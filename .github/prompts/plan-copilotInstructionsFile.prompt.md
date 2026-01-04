# Plan: Create Copilot Instructions File (Final)

Create a `.github/copilot-instructions.md` file that documents the project's architecture, coding standards, and best practices—emphasizing MUI-only components, arrow function components without React.FC, props interfaces, and sx-prop-only styling including responsive design.

## Steps

1. Create `.github/copilot-instructions.md` with project overview, tech stack, and architecture patterns
2. Document component patterns: arrow function components only, props as separate interfaces, prohibited React.FC type, MUI components exclusively for UI
3. Document styling standard: all styling via MUI `sx` prop only (including responsive design with breakpoints), no Emotion styled components, no CSS modules, no className strings
4. Document code style standards: TypeScript strictness, import path aliases, Prettier formatting rules, and no `any` types
5. Outline file structure conventions: pages with file-based routing, layouts in `_layout.tsx`, components folder with MUI-based exports, libs barrel exports
6. Define React patterns: react-hook-form for forms, Zod validation, MUI responsive breakpoints via sx prop, no manual memoization (React Compiler handles it)
7. Include development guidelines: linting/formatting checks, Firebase integration, environment variables, performance considerations

## Further Considerations

1. **Props Interface Naming** — Should props interfaces follow `ComponentNameProps` pattern for clarity? Recommendation: yes, enforce consistent naming.
2. **Responsive Design Examples** — Should the file include examples of responsive design using MUI breakpoints in sx prop? Recommendation: yes, provide clear examples.
3. **Theme Customization** — Can components use custom theme values (from `src/theme.ts`), or should sx prop values be hardcoded? Recommendation: encourage theme value usage for consistency.

## Key Constraints

- **Components Only**: MUI components exclusively for UI—no custom styled components or CSS
- **React Components**: Arrow functions only, props as separate interfaces, NO React.FC type
- **Styling**: sx prop only for all styling including responsive design, no className strings, no CSS modules
- **TypeScript**: Strict mode enforced, no `any` types, all linting rules enforced
- **Imports**: Use path aliases (lib, components, pages, hooks)
- **Forms**: react-hook-form with Zod validation
- **Performance**: React Compiler handles memoization, no manual useMemo/useCallback
- **Routing**: File-based routing via Generouted, auto-generated routes
- **Environment**: Firebase config in .env file (not hardcoded)
