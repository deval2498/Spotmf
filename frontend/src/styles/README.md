# 🌀 Styles Folder Overview

## 🎯 Purpose
Defines all global and shared styling layers used in the app, compatible with Tailwind v4 and ShadCN UI.

---

## 📁 Files

| File | Purpose |
|------|----------|
| `tailwind.css` | Entry file for Tailwind + custom layers |
| `components.css` | Shared reusable CSS component classes |
| `utilities.css` | Small functional helpers not covered by Tailwind |
| `animations.css` | Keyframes and motion utilities |
| `themes.css` | CSS variable tokens for light/dark themes |

---

## 🧱 Layer Hierarchy
1. **Base** — App-level resets and body styles
2. **Components** — Reusable CSS patterns
3. **Utilities** — Small composable helpers
4. **Themes** — Design tokens in CSS vars

---

## 🧩 Usage
- Import `src/styles/tailwind.css` in `src/app/layout.tsx`
- Reference utility classes directly (`transition-smooth`, `hide-scrollbar`)
- Use `.btn-*` and `.card` as shared component styles
- Define new theme tokens in `/src/design/theme.ts` and reflect them in `themes.css`

---

## 🧠 For Claude Code
When generating UI components:
- Prefer inline Tailwind utilities for layout.
- Use `.btn-primary`, `.card`, `.section` when possible.
- Use color tokens (`bg-primary`, `text-muted-foreground`) over hard-coded colors.
- Respect dark mode via Tailwind's `dark:` variant.
