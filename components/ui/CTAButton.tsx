import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

type CTAButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
};

const MAP = {
  primary: { color: "primary", variant: "solid" },
  secondary: { color: "secondary", variant: "solid" },
  ghost: { color: "secondary", variant: "ghost" },
} as const;

/**
 * @deprecated Use <Button> / <ButtonLink> from `./Button`. Kept as an
 * assembled default so existing call sites render through the one button
 * system while they migrate.
 */
export function CTAButton({ variant = "primary", size = "md", fullWidth, ...props }: CTAButtonProps) {
  return <Button {...MAP[variant]} size={size} block={fullWidth} {...props} />;
}
