import type { Meta } from "@storybook/nextjs";
import { theme } from "@/design/theme";
import { typography } from "@/design/typography";

const meta: Meta = {
  title: "Design/Theme",
  parameters: {
    layout: "padded",
  },
};

export default meta;

export const Colors = () => {
  const brandColorClasses: Record<string, string> = {
    primary: "bg-brand-primary",
    hover: "bg-brand-hover",
    foreground: "bg-brand-foreground",
  };

  const neutralColorClasses: Record<string, string> = {
    bg: "bg-neutral-bg",
    surface: "bg-neutral-surface",
    text: "bg-neutral-text",
    textMuted: "bg-neutral-text-muted",
    darkBg: "bg-neutral-dark-bg",
    darkSurface: "bg-neutral-dark-surface",
    border: "bg-neutral-border",
    darkBorder: "bg-neutral-dark-border",
  };

  const accentColorClasses: Record<string, string> = {
    info: "bg-accent-info",
    success: "bg-accent-success",
    warning: "bg-accent-warning",
    danger: "bg-accent-danger",
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Brand Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(theme.colors.brand).map(([name, value]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`h-24 rounded-[10px] border border-border ${brandColorClasses[name]}`} />
              <div>
                <p className="font-medium text-sm capitalize">{name}</p>
                <p className="text-xs text-gray-500">{value}</p>
                <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                  {brandColorClasses[name]}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Neutral Colors</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(theme.colors.neutral).map(([name, value]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`h-24 rounded-[10px] border border-border ${neutralColorClasses[name]}`} />
              <div>
                <p className="font-medium text-sm capitalize">
                  {name.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-xs text-gray-500">{value}</p>
                <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                  {neutralColorClasses[name]}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Accent Colors</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(theme.colors.accent).map(([name, value]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`h-24 rounded-[10px] border border-border ${accentColorClasses[name]}`} />
              <div>
                <p className="font-medium text-sm capitalize">{name}</p>
                <p className="text-xs text-gray-500">{value}</p>
                <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                  {accentColorClasses[name]}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Typography = () => {
  const sizeClasses: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
  };

  const weightClasses: Record<string, string> = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const lineHeightClasses: Record<string, string> = {
    tight: "leading-tight",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
  };

  const letterSpacingClasses: Record<string, string> = {
    tight: "tracking-tight",
    normal: "tracking-normal",
    wide: "tracking-wide",
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Type Scale</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(typography.scale).map(([label, size]) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="text-xs text-gray-500 w-16">{label}</span>
              <span className="text-xs text-gray-500 w-16">{size}</span>
              <p className={`${sizeClasses[label]} font-sans`}>
                The quick brown fox jumps over the lazy dog
              </p>
              <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded ml-auto">
                {sizeClasses[label]}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Font Weights</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(typography.weight).map(([label, weight]) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="text-xs text-gray-500 w-24">{label}</span>
              <span className="text-xs text-gray-500 w-16">{weight}</span>
              <p className={`${weightClasses[label]} font-sans`}>
                The quick brown fox jumps over the lazy dog
              </p>
              <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded ml-auto">
                {weightClasses[label]}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Font Families</h2>
        <div className="flex flex-col gap-4">
          <div className="border border-neutral-border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Sans Serif</p>
            <p className="text-lg font-sans">
              The quick brown fox jumps over the lazy dog
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 font-mono">{typography.fonts.sans}</p>
              <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                font-sans
              </code>
            </div>
          </div>
          <div className="border border-neutral-border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Monospace</p>
            <p className="text-lg font-mono">
              The quick brown fox jumps over the lazy dog
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 font-mono">{typography.fonts.mono}</p>
              <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                font-mono
              </code>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Line Heights</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(typography.lineHeight).map(([label, value]) => (
            <div key={label} className="border border-neutral-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 capitalize">{label}</span>
                <span className="text-xs text-gray-500">{value}</span>
                <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                  {lineHeightClasses[label]}
                </code>
              </div>
              <p className={`${lineHeightClasses[label]} font-sans`}>
                The quick brown fox jumps over the lazy dog. This is a longer sentence to demonstrate the line height in action when text wraps to multiple lines in the container.
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Letter Spacing</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(typography.letterSpacing).map(([label, value]) => (
            <div key={label} className="border border-neutral-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 capitalize">{label}</span>
                <span className="text-xs text-gray-500">{value}</span>
                <code className="text-xs text-brand-primary bg-neutral-bg px-1 py-0.5 rounded">
                  {letterSpacingClasses[label]}
                </code>
              </div>
              <p className={`${letterSpacingClasses[label]} text-lg font-sans`}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Spacing = () => (
  <div className="flex flex-col gap-8">
    <h2 className="text-2xl font-semibold mb-4">Spacing Scale</h2>
    <div className="flex flex-col gap-4">
      {Object.entries(theme.spacing).map(([label, value]) => (
        <div key={label} className="flex items-center gap-4">
          <span className="text-xs text-gray-500 w-16">{label}</span>
          <span className="text-xs text-gray-500 w-16">{value}</span>
          <div
            className="h-8 bg-brand-primary"
            style={{ width: value }}
          />
        </div>
      ))}
    </div>
  </div>
);

export const BorderRadius = () => (
  <div className="flex flex-col gap-8">
    <h2 className="text-2xl font-semibold mb-4">Border Radius</h2>
    <div className="grid grid-cols-4 gap-4">
      {Object.entries(theme.radius).map(([label, value]) => (
        <div key={label} className="flex flex-col gap-2">
          <div
            className="h-24 bg-brand-primary"
            style={{ borderRadius: value }}
          />
          <div>
            <p className="font-medium text-sm capitalize">{label}</p>
            <p className="text-xs text-gray-500">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const Shadows = () => (
  <div className="flex flex-col gap-8">
    <h2 className="text-2xl font-semibold mb-4">Shadows</h2>
    <div className="grid grid-cols-3 gap-8">
      {Object.entries(theme.shadows).map(([label, value]) => (
        <div key={label} className="flex flex-col gap-2">
          <div
            className="h-32 bg-white border border-border flex items-center justify-center"
            style={{ boxShadow: value }}
          >
            <p className="font-medium text-sm capitalize">{label}</p>
          </div>
          <p className="text-xs text-gray-500 font-mono">{value}</p>
        </div>
      ))}
    </div>
  </div>
);
