"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

const LABELS = ["Localisation", "Détails", "Photos", "Tarifs", "Aperçu"];

export default function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-[34px]">
      <div className="flex items-center mb-3">
        {LABELS.map((_, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "pending";
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <motion.div
                animate={state}
                initial={false}
                variants={{
                  done: { backgroundColor: "rgba(200,155,60,.12)", color: "#C89B3C", borderColor: "#C89B3C" },
                  current: { backgroundColor: "#C89B3C", color: "#07111E", borderColor: "#C89B3C" },
                  pending: { backgroundColor: "#1C2E40", color: "#3D5166", borderColor: "#1C2E40" },
                }}
                transition={{ duration: 0.35 }}
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 border-[1.5px]"
              >
                {state === "done" ? "✓" : n}
              </motion.div>
              {n < LABELS.length && (
                <div className="flex-1 h-[3px] rounded mx-0.5 bg-border relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gold"
                    initial={false}
                    animate={{ scaleX: n < step ? 1 : 0 }}
                    style={{ transformOrigin: "left" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {LABELS.map((l, i) => {
          const n = i + 1;
          return (
            <span
              key={l}
              className={clsx(
                "text-[11px] text-center flex-1",
                n === step ? "text-gold font-semibold" : n < step ? "text-gold" : "text-dim"
              )}
            >
              {l}
            </span>
          );
        })}
      </div>
    </div>
  );
}
