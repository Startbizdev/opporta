import type { TextareaHTMLAttributes } from "react";

const areaClass =
  "min-h-[8rem] w-full rounded-notion border border-border bg-field px-3 py-2.5 text-[15px] text-foreground placeholder:text-text-tertiary shadow-sm transition-colors duration-150 ease-smooth focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${areaClass} ${className}`} {...props} />;
}
