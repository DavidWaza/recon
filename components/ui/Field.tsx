import type {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * One look for every text control. Heights clear the 44px touch target;
 * the 16px-on-phones rule that stops iOS zooming lives in globals.css.
 */
export const controlVariants = cva(
  [
    "w-full min-w-0 rounded-xl border border-border bg-surface-sunken text-sm text-foreground",
    "placeholder:text-subtle transition-[border-color,box-shadow,background-color]",
    "hover:border-border-strong",
    "focus-visible:border-accent-500 focus-visible:bg-base-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/15",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-red-500 aria-invalid:ring-red-500/15",
  ],
  {
    variants: {
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-3.5",
        lg: "h-12 px-4",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** Label + control + hint stacked. Compose the parts; there is no `label` prop. */
export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field" className={cn("grid min-w-0 gap-2", className)} {...props} />;
}

/** The row above a control: label on the left, optional meta on the right. */
export function FieldHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field-header"
      className={cn("flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5", className)}
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-xs font-semibold uppercase tracking-[0.08em] text-muted", className)}
      {...props}
    />
  );
}

export function FieldHint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p data-slot="field-hint" className={cn("text-xs leading-relaxed text-subtle", className)} {...props} />
  );
}

export function FieldError({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-xs font-medium text-red-500", className)}
      {...props}
    />
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: "sm" | "md" | "lg";
};

export function Input({ className, size, ...props }: InputProps) {
  return (
    <input data-slot="input" className={cn(controlVariants({ size }), className)} {...props} />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(controlVariants(), "h-auto min-h-24 resize-y px-3.5 py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: "sm" | "md" | "lg";
};

export function Select({ className, size, children, ...props }: SelectProps) {
  return (
    <div data-slot="select" className="relative min-w-0">
      <select
        className={cn(controlVariants({ size }), "appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  );
}

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;

/** A checkbox styled as a switch. Still a real <input>, so forms and a11y work. */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <span data-slot="switch" className={cn("relative inline-flex h-6 w-11 shrink-0", className)}>
      <input type="checkbox" role="switch" className="peer absolute inset-0 z-10 cursor-pointer opacity-0" {...props} />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-border-strong bg-base-150 transition-colors peer-checked:border-accent-500 peer-checked:bg-accent-500 peer-focus-visible:ring-4 peer-focus-visible:ring-accent-500/25"
      />
      <span
        aria-hidden
        className="absolute left-0.5 top-0.5 size-5 rounded-full bg-base-950 shadow transition-transform peer-checked:translate-x-5"
      />
    </span>
  );
}
