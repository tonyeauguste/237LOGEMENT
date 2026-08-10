"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { User } from "@/lib/types";

export interface DashMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export default function DashSidebar({
  user,
  roleBadge,
  items,
  active,
  onSelect,
  footer,
}: {
  user: User;
  roleBadge: ReactNode;
  items: DashMenuItem[];
  active: string;
  onSelect: (key: string) => void;
  footer: ReactNode;
}) {
  return (
    <div className="bg-bg2 border-r border-border px-3.5 py-8 lg:sticky lg:top-[70px] lg:h-[calc(100vh-70px)] overflow-y-auto">
      <div className="text-center px-0 py-4 pb-[26px]">
        <div className="w-[72px] h-[72px] rounded-full border-2 border-gold overflow-hidden mx-auto mb-3">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="font-semibold text-[15px] text-text mb-1">{user.name}</div>
        {roleBadge}
      </div>
      <div className="h-px bg-border mb-[18px]" />
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={clsx(
            "relative flex items-center gap-3 px-3 py-[11px] rounded-[10px] text-sm w-full text-left mb-0.5 transition-colors cursor-pointer",
            active === item.key ? "bg-gold3 text-gold pl-2.5" : "text-muted hover:bg-bg3 hover:text-text"
          )}
        >
          {active === item.key && (
            <motion.span layoutId="dash-active" className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold" />
          )}
          <span className="w-[15px] h-[15px] shrink-0 flex items-center justify-center">{item.icon}</span>
          {item.label}
          {typeof item.badge === "number" && (
            <span
              className={clsx(
                "ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full",
                active === item.key ? "bg-[rgba(200,155,60,.15)] text-gold" : "bg-bg3"
              )}
            >
              {item.badge}
            </span>
          )}
        </button>
      ))}
      <div className="h-px bg-border my-4" />
      {footer}
    </div>
  );
}
