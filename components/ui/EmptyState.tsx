import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

const sizes = {
  default: {
    section: "py-14 px-6",
    iconWrap: "mb-4 size-12 rounded-notion",
    icon: "size-[22px]",
    title: "text-[15px] font-medium tracking-tight",
    description: "mt-1.5 max-w-[340px] text-sm leading-relaxed",
    action: "mt-6",
  },
  compact: {
    section: "py-8 px-4",
    iconWrap: "mb-3 size-10 rounded-notion",
    icon: "size-[18px]",
    title: "text-sm font-medium tracking-tight",
    description: "mt-1 max-w-[260px] text-2xs leading-relaxed",
    action: "mt-4",
  },
} as const;

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "default",
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const s = sizes[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${s.section} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex shrink-0 items-center justify-center border border-border bg-field shadow-sm ${s.iconWrap}`}
      >
        <Icon className={`${s.icon} text-text-tertiary`} strokeWidth={1.5} />
      </div>
      <h2 className={`text-foreground ${s.title}`}>{title}</h2>
      {description ? (
        <p className={`text-text-secondary ${s.description}`}>{description}</p>
      ) : null}
      {action ? <div className={s.action}>{action}</div> : null}
    </div>
  );
}
