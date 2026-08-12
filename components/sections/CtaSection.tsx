import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export default function CtaSection() {
  return (
    <section className="pt-0 pb-20">
      <div className="max-w-[1240px] mx-auto px-[5%]">
        <Reveal className="bg-gradient-to-br from-[#0F1E30] to-[#162A3A] border border-border rounded-[24px] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-9 lg:p-12 flex flex-col justify-center">
            <span className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">
              Propriétaires
            </span>
            <h2 className="font-display text-[clamp(22px,2.5vw,34px)] font-bold text-text my-3">
              Publiez votre bien
              <br />
              <span className="text-gold">gratuitement</span>
            </h2>
            <p className="text-muted text-[15px] leading-[1.65] mb-7">
              Rejoignez les premiers propriétaires qui font confiance à 237Logement pour trouver des
              locataires sérieux. Gestion simplifiée, zéro commission, contacts qualifiés
              directement dans votre tableau de bord.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/connexion?tab=register">
                <Button variant="gold" size="lg">
                  Publier mon bien
                </Button>
              </Link>
              <Link href="/connexion?tab=login">
                <Button variant="ghost" size="lg">
                  J&apos;ai déjà un compte
                </Button>
              </Link>
            </div>
            <div className="flex gap-5 mt-[22px] flex-wrap">
              {[
                "🔥 Publication à 0 FCFA — offre lancement",
                "Au lieu des frais d'agence habituels",
                "100% en ligne",
              ].map((f) => (
                <div key={f} className="text-xs text-muted flex items-center gap-1.5">
                  <Check size={14} className="text-green" /> {f}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative min-h-[300px]">
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80"
              alt="Belle maison"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
