import type { ButtonHTMLAttributes, ReactNode } from "react";

type CTAButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
};

const variants = {
  primary:
    "bg-accent text-foreground shadow-lg shadow-accent/25 hover:bg-accent-hover hover:shadow-accent/40",
  secondary:
    "bg-card text-foreground border border-border hover:bg-border/40 hover:border-border",
  ghost: "text-muted hover:text-foreground hover:bg-card",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function CTAButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  disabled,
  loading,
  ...props
}: CTAButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full cursor-pointer font-semibold transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      {...props}
    >
      {loading && (
        <svg
          className="-ml-1 mr-1 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}

      {children}
    </button>
  );
}
