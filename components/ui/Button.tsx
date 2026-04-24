import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-notion text-sm font-medium transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45";

const variants = {
  primary:
    "border border-primary/90 bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:border-primary-hover",
  secondary:
    "border border-border bg-surface-raised text-foreground shadow-sm hover:bg-surface-hover hover:border-border-strong",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
} as const;

const sizes = {
  default: "h-9 px-3.5",
  sm: "h-8 px-2.5 text-xs",
  lg: "h-10 px-4 text-[15px]",
  icon: "size-9 p-0",
} as const;

export const Button = forwardRef<
  HTMLButtonElement,
  {
    children: ReactNode;
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    disabled?: boolean;
    className?: string;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className">
>(function Button(
  {
    children,
    variant = "primary",
    size = "default",
    disabled = false,
    className = "",
    type = "button",
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
