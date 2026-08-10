"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

const ICONS = { success: "✅", error: "❌", info: "ℹ️" };
const BORDER = {
  success: "border-l-green",
  error: "border-l-red",
  info: "border-l-gold",
};

export default function Toaster() {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-[90vw]">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`bg-card border border-border2 border-l-[3px] ${BORDER[t.type]} rounded-xl px-[18px] py-3.5 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,.4)] text-sm max-w-[320px]`}
          >
            <span className="text-lg">{ICONS[t.type]}</span>
            <span className="text-text">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
