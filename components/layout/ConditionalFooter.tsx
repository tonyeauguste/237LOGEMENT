"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Le footer public (liens, réseaux sociaux…) n'a pas sa place sur les
// écrans "applicatifs" : la page de connexion et le tableau de bord ont
// leur propre mise en page pleine hauteur. Il y était surtout gênant sur
// mobile, où il apparaissait collé sous la navbar pendant le chargement
// du tableau de bord, donnant l'impression d'une page cassée.
const HIDDEN_ON = ["/connexion", "/compte"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;
  return <Footer />;
}
