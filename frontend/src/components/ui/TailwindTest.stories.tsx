import type { Meta } from "@storybook/nextjs";
import { Button } from "./button";

const meta: Meta = {
  title: "🧪 Tailwind v4 / System Check",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#F4F5F8" },
        { name: "dark", value: "#0F1724" },
      ],
    },
  },
};

export default meta;

// ✅ Test 1 — Tailwind base utilities
export const Utilities = () => (
  <div
    className="min-h-[300px] flex flex-col items-center justify-center gap-4 p-6"
    style={{
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-foreground)'
    }}
  >
    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
      Tailwind v4 Utilities
    </h1>
    <p style={{ color: 'var(--color-muted-foreground)' }}>
      If you can see color + spacing, base layer works ✅
    </p>
    <div className="flex gap-4">
      <button
        className="rounded-[--radius-md] px-4 py-2 hover:brightness-95 active:brightness-90 transition-all"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)'
        }}
      >
        Test Button
      </button>
      <button
        className="rounded-[--radius-md] border px-4 py-2 hover:brightness-110 transition-all"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-foreground)'
        }}
      >
        Outline Variant
      </button>
    </div>
  </div>
);

// ✅ Test 2 — ShadCN components
export const ShadcnComponents = () => (
  <div className="p-8 flex flex-col gap-6">
    <div
      className="max-w-sm p-6 shadow-sm border rounded-[--radius-lg]"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-card-foreground)'
      }}
    >
      <h2 className="text-xl font-semibold mb-2">ShadCN + Tailwind v4</h2>
      <p className="mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
        This test ensures ShadCN UI components still render correctly with Tailwind v4 layers.
      </p>
      <div className="flex gap-2 flex-wrap">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
    </div>
  </div>
);

// ✅ Test 3 — Typography & color tokens
export const Tokens = () => {
  const colorTokens = [
    { label: "Primary", bg: "var(--color-primary)", fg: "var(--color-primary-foreground)" },
    { label: "Background", bg: "var(--color-background)", fg: "var(--color-foreground)" },
    { label: "Card", bg: "var(--color-card)", fg: "var(--color-card-foreground)" },
    { label: "Muted", bg: "var(--color-muted)", fg: "var(--color-muted-foreground)" },
    { label: "Secondary", bg: "var(--color-secondary)", fg: "var(--color-secondary-foreground)" },
    { label: "Accent", bg: "var(--color-accent)", fg: "var(--color-accent-foreground)" },
    { label: "Destructive", bg: "var(--color-destructive)", fg: "var(--color-destructive-foreground)" },
    { label: "Border", bg: "var(--color-background)", fg: "var(--color-foreground)", showBorder: true },
  ];

  return (
    <div className="p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>
        Design Tokens Check
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {colorTokens.map(({ label, bg, fg, showBorder }) => (
          <div
            key={label}
            className="rounded-[--radius-md] p-4 flex items-center justify-center text-sm font-medium"
            style={{
              backgroundColor: bg,
              color: fg,
              ...(showBorder && { border: '4px solid var(--color-border)' })
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs">XS text (0.75rem)</p>
        <p className="text-sm">Small text (0.875rem)</p>
        <p className="text-base">Base text (1rem)</p>
        <p className="text-lg">Large text (1.125rem)</p>
        <p className="text-xl font-semibold">XL Semibold text (1.25rem)</p>
        <p className="text-3xl font-bold">3XL Bold text (1.875rem)</p>
      </div>

      <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold mb-3">Radius Tokens</h3>
        <div className="flex gap-4">
          <div
            className="px-4 py-2 rounded-[--radius-sm]"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)'
            }}
          >
            Small (--radius-sm)
          </div>
          <div
            className="px-4 py-2 rounded-[--radius-md]"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)'
            }}
          >
            Medium (--radius-md)
          </div>
          <div
            className="px-4 py-2 rounded-[--radius-lg]"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)'
            }}
          >
            Large (--radius-lg)
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Test 4 — Complete layout test
export const CompleteLayoutTest = () => (
  <div
    className="min-h-screen p-8"
    style={{
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-foreground)'
    }}
  >
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
        <h1 className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Complete Tailwind v4 Test
        </h1>
        <p className="mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
          Testing all Tailwind v4 layers: base, components, and utilities
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Primary", "Secondary", "Accent"].map((variant) => (
          <div
            key={variant}
            className="border p-6 rounded-[--radius-lg] shadow-sm hover:shadow-md transition-shadow"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-card-foreground)' }}
            >
              {variant} Card
            </h3>
            <p className="mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              This card demonstrates proper theme token usage with Tailwind v4.
            </p>
            <Button size="sm">{variant} Action</Button>
          </div>
        ))}
      </div>

      <div
        className="p-6 rounded-[--radius-lg]"
        style={{ backgroundColor: 'var(--color-muted)' }}
      >
        <h2 className="text-2xl font-semibold mb-4">Status Indicators</h2>
        <div className="flex flex-wrap gap-3">
          <span
            className="px-3 py-1 rounded-[--radius-sm] text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)'
            }}
          >
            Info
          </span>
          <span
            className="px-3 py-1 rounded-[--radius-sm] text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-foreground)'
            }}
          >
            Accent
          </span>
          <span
            className="px-3 py-1 rounded-[--radius-sm] text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-destructive)',
              color: 'var(--color-destructive-foreground)'
            }}
          >
            Error
          </span>
          <span
            className="px-3 py-1 rounded-[--radius-sm] text-sm font-medium"
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-secondary-foreground)'
            }}
          >
            Secondary
          </span>
        </div>
      </div>
    </div>
  </div>
);
