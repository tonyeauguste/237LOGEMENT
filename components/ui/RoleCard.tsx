"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

export default function RoleCard({
  icon,
  title,
  desc,
  active,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={clsx(
        "p-4 rounded-xl border-[1.5px] transition-colors duration-200",
        onClick && "cursor-pointer",
        active ? "border-gold bg-gold3" : "border-border bg-card hover:border-gold"
      )}
    >
      <div className="text-[22px] mb-1.5">{icon}</div>
      <div className={clsx("font-semibold text-sm", active ? "text-gold" : "text-text")}>
        {title}
      </div>
      <div className="text-[11px] text-muted mt-[3px] leading-tight">{desc}</div>
    </motion.div>
  );
}
