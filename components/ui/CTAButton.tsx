import type { ButtonHTMLAttributes, ReactNode } from "react";

type CTAButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
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
  ...props
}: CTAButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
