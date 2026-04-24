import type { InputHTMLAttributes } from "react";

const inputClass =
  "h-10 w-full rounded-notion border border-border bg-field px-3 text-[15px] text-foreground placeholder:text-text-tertiary shadow-sm transition-colors duration-150 ease-smooth focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50";

export function Input({
  type = "text",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input type={type} className={`${inputClass} ${className}`} {...props} />
  );
}
