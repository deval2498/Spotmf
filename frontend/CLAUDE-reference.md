# CLAUDE Reference — Detailed Frontend Architecture Guide

> **Quick rules? See [CLAUDE.md](./CLAUDE.md)**
> This document provides comprehensive examples, setup instructions, and architectural rationale.

---

## 📦 Tech Stack Overview

- **Framework:** Next.js with App Router
- **Language:** TypeScript (strict mode)
- **UI Layer:** ShadCN UI + Tailwind CSS
- **Styling:** Tailwind utilities with ShadCN design tokens
- **State Management (Client):** Zustand for global UI state
- **State Management (Server):** TanStack Query for async/server data
- **Component Testing:** Storybook for isolated development and visual QA

---

## 🧭 Philosophy: Progressive Promotion

This architecture prevents **premature abstraction** and keeps the codebase **modular** and **maintainable**.

### The Rule

> Components, hooks, or utilities that are only used by a single page remain at the **page level**.
> When they are shared between pages, they are **moved upward** to the global directories.

### Why?

- **Clarity:** Easy to find where code is used
- **Modularity:** Page-specific code stays isolated
- **No bloat:** Global directories only contain truly shared code
- **Refactor-friendly:** Easy to promote when needs change

---

## 🏗️ Complete Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Root page
│   ├── providers.tsx       # Client providers (TanStack Query, etc.)
│   ├── (marketing)/        # Route group example
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── components/     # Dashboard-only components
│   │   │   └── WalletCard.tsx
│   │   ├── hooks/          # Dashboard-only hooks
│   │   │   └── useWalletData.ts
│   │   └── utils/          # Dashboard-only utilities
│   │       └── formatBalance.ts
│   └── ...
│
├── components/             # Shared components (used by 2+ pages)
│   ├── ui/                 # ShadCN primitives (button, input, etc.)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── dialog.tsx
│   ├── layout/             # Layout components (nav, footer, etc.)
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── shared/             # Cross-page shared components
│       └── UserAvatar.tsx
│
├── hooks/                  # Shared React hooks
│   └── useAuth.ts
│
├── lib/                    # Shared utilities, API clients, helpers
│   ├── api.ts
│   └── utils.ts
│
├── store/                  # Zustand global stores
│   ├── useThemeStore.ts
│   └── useModalStore.ts
│
├── styles/                 # Global CSS
│   └── globals.css
│
├── types/                  # Shared TypeScript types
│   └── index.ts
│
└── stories/                # Storybook decorators, mocks (optional)
    └── decorators.tsx
```

---

## 🧩 Component Architecture

### 1. Page-Level Components

**When to use:**
- Component is only used in ONE page
- Not needed elsewhere (yet)

**Location:**
```
src/app/{page}/components/ComponentName.tsx
```

**Example:**

```tsx
// src/app/dashboard/components/WalletCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WalletCard({ balance }: { balance: number }) {
  return (
    <Card>
      <h3>Wallet Balance</h3>
      <p>${balance}</p>
      <Button>Add Funds</Button>
    </Card>
  );
}
```

**Usage:**
```tsx
// src/app/dashboard/page.tsx
import { WalletCard } from "./components/WalletCard";

export default function DashboardPage() {
  return <WalletCard balance={1000} />;
}
```

---

### 2. Shared Components

**When to promote:**
- Component is now used in 2+ pages
- Component will likely be reused

**Location:**
```
src/components/shared/ComponentName.tsx
```

**Example:**

```tsx
// src/components/shared/UserAvatar.tsx
import { Avatar } from "@/components/ui/avatar";

export function UserAvatar({
  name,
  imageUrl
}: {
  name: string;
  imageUrl?: string;
}) {
  return (
    <Avatar>
      <img src={imageUrl || "/default-avatar.png"} alt={name} />
    </Avatar>
  );
}
```

**Usage:**
```tsx
// Can now be used anywhere
import { UserAvatar } from "@/components/shared/UserAvatar";
```

---

### 3. UI Components (ShadCN)

**When to use:**
- For all foundational UI primitives
- Generated via ShadCN CLI

**Location:**
```
src/components/ui/component-name.tsx
```

**How to add:**
```bash
npx shadcn-ui add button
npx shadcn-ui add input
npx shadcn-ui add dialog
```

**These are NEVER page-scoped** — they're global building blocks.

---

## ⚙️ Hooks Architecture

### Pattern: `use[Feature][Verb].ts`

**Examples:**
- `useWalletConnect.ts`
- `useFetchUser.ts`
- `useModalState.ts`

### Page-Level Hooks

```tsx
// src/app/dashboard/hooks/useWalletData.ts
import { useQuery } from "@tanstack/react-query";
import { fetchWalletBalance } from "@/lib/api";

export function useWalletData(userId: string) {
  return useQuery({
    queryKey: ["wallet", userId],
    queryFn: () => fetchWalletBalance(userId),
  });
}
```

### Shared Hooks

```tsx
// src/hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
  });
}
```

---

## 🧠 Utilities / Lib

### Page-Level Utilities

```ts
// src/app/dashboard/utils/formatBalance.ts
export function formatBalance(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
```

### Shared Utilities

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 🧱 State Management Deep Dive

### 1. Zustand — Client/Global State

**Use for:**
- UI state (theme, sidebar open/closed)
- Modal state
- Client-side filters/preferences
- Ephemeral data that doesn't need server sync

**DO NOT use for:**
- Server data (use TanStack Query)
- Async fetching (use TanStack Query)

**Location:**
```
src/store/useFeatureStore.ts
```

**Example: Theme Store**

```ts
// src/store/useThemeStore.ts
import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light"
    })),
  setTheme: (theme) => set({ theme }),
}));
```

**Usage:**

```tsx
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

**Best Practices:**
- One store per feature domain
- Keep stores flat (avoid deep nesting)
- Use selectors for derived values
- TypeScript interfaces for state shape

---

### 2. TanStack Query — Server/Async State

**Use for:**
- API data fetching
- Server state (user info, balances, transactions)
- Anything that comes from a backend

**Setup:**

```tsx
// src/app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Root Layout Integration:**

```tsx
// src/app/layout.tsx
import Providers from "@/app/providers";

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Example Query Hook:**

```ts
// src/hooks/useUserProfile.ts
import { useQuery } from "@tanstack/react-query";

async function fetchUserProfile(id: string) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserProfile(id),
    enabled: !!id, // Only fetch if id exists
  });
}
```

**Example Mutation Hook:**

```ts
// src/hooks/useUpdateProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function updateProfile(data: { name: string; email: string }) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
```

**Usage:**

```tsx
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

export function ProfilePage({ userId }: { userId: string }) {
  const { data, isLoading, error } = useUserProfile(userId);
  const updateProfile = useUpdateProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleUpdate = () => {
    updateProfile.mutate({
      name: "New Name",
      email: "new@email.com"
    });
  };

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

**Best Practices:**
- Always define `queryKey` arrays for caching
- Use `enabled` to conditionally fetch
- Invalidate queries after mutations
- Handle loading and error states
- Keep query hooks in `/hooks/` directory

---

### State Boundary Decision Tree

```
Is this data from a server/API?
├─ Yes → Use TanStack Query
└─ No
   ├─ Does it need to be shared across multiple components?
   │  ├─ Yes → Use Zustand
   │  └─ No → Use useState
   └─ Is it just local component state?
      └─ Yes → Use useState
```

---

## 🎨 Styling Guidelines

### Tailwind Utilities

```tsx
<div className="flex items-center gap-4 p-6 bg-gray-100 rounded-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### ShadCN Customization

```tsx
// Override ShadCN component styles
import { Button } from "@/components/ui/button";

<Button className="bg-primary hover:bg-primary/90">
  Custom Style
</Button>
```

### Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
}
```

---

## 📘 Storybook Integration

### Why Storybook?

- **Isolated development:** Build components without running full app
- **Visual testing:** See all component states at once
- **Documentation:** Auto-generated docs from stories
- **Design QA:** Verify theming and responsive behavior

### File Placement

Stories live alongside their components:

```
src/app/dashboard/components/
├── WalletCard.tsx
└── WalletCard.stories.tsx

src/components/shared/
├── UserAvatar.tsx
└── UserAvatar.stories.tsx

src/components/ui/
├── button.tsx
└── button.stories.tsx
```

### Example Story

```tsx
// src/components/shared/UserAvatar.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { UserAvatar } from "./UserAvatar";

const meta: Meta<typeof UserAvatar> = {
  title: "Shared/UserAvatar",
  component: UserAvatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const Default: Story = {
  args: {
    name: "John Doe",
    imageUrl: "https://i.pravatar.cc/150?img=1",
  },
};

export const NoImage: Story = {
  args: {
    name: "Jane Smith",
  },
};
```

### Promotion Rule

When you promote a component from page-level to shared:
1. Move `Component.tsx` to `src/components/shared/`
2. Move `Component.stories.tsx` alongside it
3. Update story `title` to reflect new location

---

## 🧪 TypeScript Best Practices

### Absolute Imports

```tsx
// ✅ Good
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// ❌ Bad
import { Button } from "../../../components/ui/button";
```

### Named Exports

```tsx
// ✅ Good
export function UserCard() { ... }
export const API_URL = "...";

// ❌ Bad (default exports)
export default function UserCard() { ... }
```

### Type Safety

```tsx
// Define types for props
interface UserCardProps {
  name: string;
  email: string;
  role?: "admin" | "user";
}

export function UserCard({ name, email, role = "user" }: UserCardProps) {
  return <div>...</div>;
}
```

---

## 🔍 Code Quality

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `UserAvatar.tsx` |
| Hooks | camelCase with `use` prefix | `useWalletConnect.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Folders | kebab-case | `user-profile/` |

### File Organization

```tsx
// Order of declarations in a component file:

// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);

  return <div>...</div>;
}

// 4. Helper functions (if needed)
function helperFunction() { ... }
```

---

## 🧰 Development Commands

```bash
# Development
npm run dev             # Start Next.js dev server
npm run build           # Production build
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler check

# Storybook
npm run storybook       # Start Storybook dev server
npm run build-storybook # Build static Storybook

# Testing
npm run test            # Run tests (if configured)
npm run test:watch      # Run tests in watch mode
```

---

## 📋 Promotion Checklist

When promoting from page-level to shared:

### Components
- [ ] Move from `src/app/{page}/components/` to `src/components/shared/`
- [ ] Update all imports in consuming pages
- [ ] Move associated `.stories.tsx` file
- [ ] Update story title in Storybook
- [ ] Verify component works in all consuming pages

### Hooks
- [ ] Move from `src/app/{page}/hooks/` to `src/hooks/`
- [ ] Update imports
- [ ] Ensure no page-specific logic remains
- [ ] Update any related tests

### Utilities
- [ ] Move from `src/app/{page}/utils/` to `src/lib/`
- [ ] Update imports
- [ ] Verify function is truly generic

---

## 🎯 Summary Table

| Asset Type | Single Page | Multiple Pages | Never Page-Scoped |
|------------|------------|----------------|-------------------|
| **Component** | `app/{page}/components/` | `components/shared/` | `components/ui/` (ShadCN) |
| **Hook** | `app/{page}/hooks/` | `hooks/` | — |
| **Utility** | `app/{page}/utils/` | `lib/` | — |
| **Story** | Same dir as component | Same dir as component | — |
| **UI State** | `useState` | `store/` (Zustand) | — |
| **Server State** | — | `hooks/` (TanStack Query) | — |

---

## 🔗 Additional Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [ShadCN UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TanStack Query](https://tanstack.com/query/latest)
- [Storybook](https://storybook.js.org/)

---

**Maintained by:** [Your Team]
**Last Updated:** [Date]
**Version:** 1.0
