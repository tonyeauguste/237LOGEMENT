"use client";

// Barre segmentée (façon Rent237) : 4 crans qui se colorent au fur et à
// mesure que le mot de passe gagne en robustesse (longueur, majuscule,
// chiffre, caractère spécial). Purement indicatif — la seule règle
// bloquante reste "8 caractères minimum" (imposée par Supabase Auth).
function scorePassword(pwd: string): number {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  return score;
}

const COLORS = ["bg-border2", "bg-red", "bg-orange", "bg-gold", "bg-green2"];

export default function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  return (
    <div className="flex gap-1.5 mt-2 mb-1">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
            i < score ? COLORS[score] : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}
