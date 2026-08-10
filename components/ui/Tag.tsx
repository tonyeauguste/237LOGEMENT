import clsx from "clsx";
import type { ReactNode } from "react";

export type TagColor = "gold" | "green" | "blue" | "red" | "neutral";

const colorClasses: Record<TagColor, string> = {
  gold: "bg-gold3 text-gold border border-[rgba(200,155,60,.28)]",
  green: "bg-[rgba(61,153,112,.1)] text-green2 border border-[rgba(61,153,112,.28)]",
  blue: "bg-[rgba(99,179,237,.1)] text-blue border border-[rgba(99,179,237,.28)]",
  red: "bg-[rgba(224,85,85,.1)] text-red border border-[rgba(224,85,85,.28)]",
  neutral: "bg-card2 text-muted border border-border",
};

export default function Tag({
  color = "gold",
  children,
  className,
}: {
  color?: TagColor;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "text-[11px] px-[11px] py-[3px] rounded-full font-semibold tracking-[.3px] inline-flex items-center gap-1",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
