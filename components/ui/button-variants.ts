import { cva, type VariantProps } from "class-variance-authority";

/**
 * `color` and `variant` are declared with empty strings; the real classes live
 * in compoundVariants. That keeps the two axes orthogonal — five colours ×
 * four variants without twenty named options.
 */
export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-full border font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      color: {
        primary: "",
        secondary: "",
        destructive: "",
        success: "",
        neutral: "",
      },
      variant: {
        solid: "",
        soft: "",
        outline: "",
        ghost: "border-transparent",
      },
      // Every size clears the 44px touch target except `xs`/`sm`, which are
      // for dense desktop toolbars and are padded up on phones by callers.
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        "icon-sm": "size-9",
        icon: "size-11",
      },
      block: {
        true: "w-full",
      },
    },
    compoundVariants: [
      // primary
      {
        color: "primary",
        variant: "solid",
        class:
          "border-accent-500 bg-accent-500 text-base-950 shadow-glow hover:border-accent-600 hover:bg-accent-600",
      },
      {
        color: "primary",
        variant: "soft",
        class:
          "border-accent-150 bg-accent-50 text-base-900 hover:border-accent-500/60 hover:bg-accent-100",
      },
      {
        color: "primary",
        variant: "outline",
        class: "border-accent-500/60 text-base-900 hover:bg-accent-50",
      },
      {
        color: "primary",
        variant: "ghost",
        class: "text-accent-500 hover:bg-accent-50 hover:text-base-900",
      },
      // secondary — the neutral surface button
      {
        color: "secondary",
        variant: "solid",
        class:
          "border-base-400 bg-base-100 text-base-900 hover:border-base-500 hover:bg-base-150",
      },
      {
        color: "secondary",
        variant: "soft",
        class: "border-transparent bg-base-100 text-base-900 hover:bg-base-150",
      },
      {
        color: "secondary",
        variant: "outline",
        class: "border-base-400 text-base-900 hover:border-base-500 hover:bg-base-100",
      },
      {
        color: "secondary",
        variant: "ghost",
        class: "text-base-600 hover:bg-base-100 hover:text-base-900",
      },
      // destructive
      {
        color: "destructive",
        variant: "solid",
        class: "border-red-600 bg-red-600 text-base-950 hover:bg-red-500",
      },
      {
        color: "destructive",
        variant: "soft",
        class: "border-red-150 bg-red-50 text-red-500 hover:bg-red-100",
      },
      {
        color: "destructive",
        variant: "outline",
        class: "border-red-150 text-red-500 hover:bg-red-50",
      },
      {
        color: "destructive",
        variant: "ghost",
        class: "text-red-500 hover:bg-red-50",
      },
      // success
      {
        color: "success",
        variant: "solid",
        class: "border-green-600 bg-green-600 text-base-950 hover:bg-green-500",
      },
      {
        color: "success",
        variant: "soft",
        class: "border-green-150 bg-green-50 text-green-500 hover:bg-green-100",
      },
      {
        color: "success",
        variant: "outline",
        class: "border-green-150 text-green-500 hover:bg-green-50",
      },
      {
        color: "success",
        variant: "ghost",
        class: "text-green-500 hover:bg-green-50",
      },
      // neutral — high-contrast white button for over-image placement
      {
        color: "neutral",
        variant: "solid",
        class: "border-base-950 bg-base-950 text-base-0 hover:bg-base-900",
      },
      {
        color: "neutral",
        variant: "soft",
        class:
          "border-base-950/15 bg-base-950/10 text-base-950 backdrop-blur-md hover:bg-base-950/20",
      },
      {
        color: "neutral",
        variant: "outline",
        class: "border-base-950/30 text-base-950 hover:bg-base-950/10",
      },
      {
        color: "neutral",
        variant: "ghost",
        class: "text-base-950 hover:bg-base-950/10",
      },
    ],
    defaultVariants: {
      color: "primary",
      variant: "solid",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
