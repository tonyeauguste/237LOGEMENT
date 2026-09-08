"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Camera } from "lucide-react";
import type { User } from "@/lib/types";
import { DEFAULT_AVATAR } from "@/lib/data";

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
  onAvatarChange,
  avatarUploading,
  avatarEditLabel,
}: {
  user: User;
  roleBadge: ReactNode;
  items: DashMenuItem[];
  active: string;
  onSelect: (key: string) => void;
  footer: ReactNode;
  /** Photo modifiable directement depuis la sidebar — jusqu'ici seul
   *  l'onglet Paramètres (enfoui) le permettait, alors que c'est cet
   *  avatar-ci, visible en permanence, que l'utilisateur associe le plus
   *  naturellement à "ma photo de profil". Optionnel : sans ce prop,
   *  l'avatar reste affichage seul (comportement précédent inchangé). */
  onAvatarChange?: (file: File) => void;
  avatarUploading?: boolean;
  avatarEditLabel?: string;
}) {
  return (
    <div className="bg-bg2 border-r border-border px-3.5 py-8 lg:sticky lg:top-[70px] lg:h-[calc(100vh-70px)] overflow-y-auto">
      <div className="text-center px-0 py-4 pb-[26px]">
        <div className="relative w-[72px] h-[72px] mx-auto mb-3">
          <div className="w-full h-full rounded-full border-2 border-gold overflow-hidden">
            <img src={user.avatar || DEFAULT_AVATAR} alt={user.name} className="w-full h-full object-cover" />
            {avatarUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          {onAvatarChange && (
            <>
              {/* <label htmlFor> plutôt qu'un onClick JS sur l'input caché :
                  plus fiable au tap sur Android/iOS — même pattern que
                  l'upload de photos dans Paramètres et PhotoUploader.tsx. */}
              <label
                htmlFor="sidebar-avatar-input"
                aria-label={avatarEditLabel}
                title={avatarEditLabel}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-gold text-[#07111E] flex items-center justify-center border-2 border-bg2 cursor-pointer hover:brightness-110 transition"
              >
                <Camera size={12} strokeWidth={2.5} />
              </label>
              <input
                id="sidebar-avatar-input"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={avatarUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAvatarChange(file);
                  e.target.value = "";
                }}
              />
            </>
          )}
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
