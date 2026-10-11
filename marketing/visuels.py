# -*- coding: utf-8 -*-
"""
Visuels publicitaires 237Logement — tous formats.

Textes alignes sur le discours du site apres son ouverture aux agences :
plus de « sans demarcheur », « sans intermediaire » ni « frais d'agence ».
La promesse porte sur la commission que 237Logement ne preleve pas, et
celui qui publie est « le proprietaire ou l'agence ».
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance

# Chemins resolus depuis l'emplacement du script, pas depuis le repertoire
# courant : le script doit marcher qu'on le lance depuis la racine du depot
# ou depuis marketing/.
ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ICI, "sources")
OUT = os.path.join(ICI, "visuels")
os.makedirs(OUT, exist_ok=True)

NAVY, CARD, CARD2 = (7, 17, 30), (14, 26, 40), (19, 32, 47)
GOLD, GOLD2 = (200, 155, 60), (232, 201, 122)
TEXT, MUTED, DIM, GREEN = (237, 233, 225), (122, 144, 168), (61, 81, 102), (79, 195, 138)

F = "C:/Windows/Fonts/"
SERIF_B, SANS_B, SANS = "georgiab.ttf", "arialbd.ttf", "arial.ttf"


def font(n, s):
    return ImageFont.truetype(F + n, s)


def w_of(d, t, f):
    b = d.textbbox((0, 0), t, font=f)
    return b[2] - b[0]


def h_of(d, t, f):
    b = d.textbbox((0, 0), t, font=f)
    return b[3] - b[1]


def wrap(d, txt, f, maxw):
    out, line = [], ""
    for mot in txt.split():
        essai = (line + " " + mot).strip()
        if w_of(d, essai, f) <= maxw:
            line = essai
        else:
            if line:
                out.append(line)
            line = mot
    if line:
        out.append(line)
    return out


def vignette(img, force=120):
    W, H = img.size
    grad = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(grad)
    for i in range(force):
        gd.rectangle([i, i, W - i, H - i], outline=int(58 * (1 - i / force)))
    return Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), img,
                           grad.point(lambda p: p // 2))


def fond(W, H):
    img = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(img)
    r0 = int(min(W, H) * 0.52)
    for r in range(r0, 0, -8):
        a = int(16 * (1 - r / r0))
        if a > 0:
            d.ellipse([W - 180 - r, -230 - r, W - 180 + r, -230 + r],
                      fill=(NAVY[0] + a, NAVY[1] + a - 2, NAVY[2] + a - 6))
    return img, d


def badge(d, x, y, size):
    d.rounded_rectangle([x, y, x + size, y + size], radius=int(size * 0.23), fill=GOLD)
    f = font(SERIF_B, int(size * 0.37))
    d.text((x + size / 2 - w_of(d, "237", f) / 2,
            y + size / 2 - h_of(d, "237", f) / 2 - size * 0.06), "237", font=f, fill=NAVY)


def wordmark(d, x, y, size):
    f = font(SERIF_B, size)
    d.text((x, y), "237", font=f, fill=GOLD)
    d.text((x + w_of(d, "237", f), y), "LOGEMENT", font=f, fill=TEXT)


def cta(d, x, y, size, label="237logement.org"):
    f = font(SANS_B, size)
    d.rounded_rectangle([x, y, x + w_of(d, label, f) + size * 1.7, y + size * 2.05],
                        radius=int(size * 1.03), fill=GOLD)
    d.text((x + size * 0.85, y + size * 1.02 - h_of(d, label, f) / 2 - size * 0.16),
           label, font=f, fill=NAVY)


def check(d, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD)
    k = r / 20
    d.line([cx - 9 * k, cy + 1 * k, cx - 3 * k, cy + 7 * k], fill=NAVY, width=max(3, int(5 * k)))
    d.line([cx - 3 * k, cy + 7 * k, cx + 9 * k, cy - 8 * k], fill=NAVY, width=max(3, int(5 * k)))


def cover(img, tw, th, fx=0.5, fy=0.42):
    iw, ih = img.size
    s = max(tw / iw, th / ih)
    im = img.resize((int(iw * s + 1), int(ih * s + 1)), Image.LANCZOS)
    nw, nh = im.size
    x, y = int((nw - tw) * fx), int((nh - th) * fy)
    return im.crop((x, y, x + tw, y + th))


def duotone(img):
    """La photo entre dans la charte au lieu de jurer a cote."""
    g = ImageOps.grayscale(img)
    g = ImageOps.autocontrast(g, cutoff=1)
    g = ImageEnhance.Brightness(g).enhance(1.32)
    g = ImageEnhance.Contrast(g).enhance(1.08)
    return ImageOps.colorize(g, black=(18, 33, 52), mid=(142, 120, 86), white=(252, 243, 226))


# ═══════════════ CONTENU — source unique des textes ═══════════════
# Chaque visuel : surtitre, titre, sous-titre, puces.
CONTENUS = {
    "1-locataires": dict(
        sur="LOCATAIRES",
        titre="Trouvez votre logement en contact direct.",
        sous="Cherchez par ville, par quartier, par budget. Les vraies photos, "
             "le vrai prix, et votre interlocuteur au bout du fil.",
        puces=["Aucune commission prélevée",
               "Contact direct avec le propriétaire ou l'agence",
               "Annonceurs vérifiés"],
        puces_courtes=["Aucune commission", "Contact direct", "Annonceurs vérifiés"],
    ),
    "2-proprietaires": dict(
        sur="PROPRIÉTAIRES & AGENCES",
        titre="Votre bien est vide ? Publiez-le gratuitement.",
        sous="Cinq minutes suffisent. Vous recevez les demandes directement, "
             "et 237Logement ne prend aucun pourcentage sur vos loyers.",
        encart=("0", "FCFA de commission", "Publication gratuite, sans abonnement."),
    ),
    "3-lancement": dict(
        sur="EN LIGNE MAINTENANT",
        titre="La plateforme immobilière du Cameroun.",
        sous="Yaoundé, Douala, Bafoussam, Kribi et partout ailleurs. "
             "Location courte ou longue durée, en contact direct.",
        cartes=[("Vous cherchez", "un logement"), ("Vous publiez", "un bien")],
    ),
    "4-confiance": dict(
        sur="POURQUOI 237LOGEMENT",
        titre="Trois raisons d'y aller les yeux fermés.",
        items=[("Annonceurs vérifiés", "Particuliers comme professionnels."),
               ("Contact direct", "Vous parlez au propriétaire ou à l'agence."),
               ("Aucune commission", "237Logement ne prend aucun pourcentage.")],
    ),
}


# ═══════════════ TYPOGRAPHIQUES — STORY 1080x1920 ═══════════════
def story_typo(cle):
    c = CONTENUS[cle]
    W, H = 1080, 1920
    img, d = fond(W, H)
    badge(d, 80, 150, 104 if cle != "3-lancement" else 120)
    wordmark(d, 210 if cle != "3-lancement" else 232, 178 if cle != "3-lancement" else 186, 42)

    y = 430 if cle != "3-lancement" else 520
    coul = GREEN if cle == "3-lancement" else GOLD
    d.text((80, y), "   ".join(c["sur"]), font=font(SANS_B, 28), fill=coul)
    y += 60

    f = font(SERIF_B, 104 if cle != "3-lancement" else 108)
    for ligne in wrap(d, c["titre"], f, 920):
        d.text((80, y), ligne, font=f, fill=TEXT)
        y += int(f.size * 1.14)

    if c.get("sous"):
        y += 40
        fb = font(SANS, 38)
        for ligne in wrap(d, c["sous"], fb, 880):
            d.text((80, y), ligne, font=fb, fill=MUTED)
            y += 57

    if c.get("puces"):
        y += 60
        for t in c["puces"]:
            d.ellipse([80, y + 14, 94, y + 28], fill=GOLD)
            ft = font(SANS, 36)
            for i, ligne in enumerate(wrap(d, t, ft, 860)):
                d.text((120, y + i * 48), ligne, font=ft, fill=TEXT)
            y += 48 * len(wrap(d, t, ft, 860)) + 20

    if c.get("encart"):
        y += 70
        gros, titre, sous = c["encart"]
        d.rounded_rectangle([80, y, 1000, y + 240], radius=28, fill=CARD,
                            outline=(28, 46, 64), width=2)
        d.text((130, y + 44), gros, font=font(SERIF_B, 118), fill=GOLD)
        d.text((260, y + 74), titre, font=font(SANS_B, 40), fill=TEXT)
        d.text((260, y + 132), sous, font=font(SANS, 31), fill=MUTED)

    if c.get("cartes"):
        y += 80
        for i, (t, s) in enumerate(c["cartes"]):
            x = 80 + i * 470
            d.rounded_rectangle([x, y, x + 450, y + 200], radius=26, fill=CARD2,
                                outline=(28, 46, 64), width=2)
            d.text((x + 40, y + 52), t, font=font(SANS_B, 38), fill=GOLD2)
            d.text((x + 40, y + 110), s, font=font(SANS, 34), fill=MUTED)

    if c.get("items"):
        y += 70
        for t, s in c["items"]:
            d.rounded_rectangle([80, y, 1000, y + 172], radius=26, fill=CARD,
                                outline=(28, 46, 64), width=2)
            check(d, 146, y + 82, 22)
            d.text((208, y + 46), t, font=font(SANS_B, 40), fill=TEXT)
            d.text((208, y + 100), s, font=font(SANS, 30), fill=MUTED)
            y += 200

    d.text((80, H - 214), "LOUER  ·  PUBLIER  ·  GÉRER", font=font(SANS, 27), fill=DIM)
    cta(d, 80, H - 168, 46)
    return vignette(img)


# ═══════════════ TYPOGRAPHIQUES — CARRÉ 1080x1080 ═══════════════
def carre_typo(cle):
    c = CONTENUS[cle]
    W = H = 1080
    M = 72
    img, d = fond(W, H)
    badge(d, M, 70, 76 if cle != "3-lancement" else 88)
    wordmark(d, M + 96 if cle != "3-lancement" else M + 110, 92 if cle != "3-lancement" else 94, 34)

    y = 250 if cle != "3-lancement" else 268
    coul = GREEN if cle == "3-lancement" else GOLD
    d.text((M, y), "   ".join(c["sur"]), font=font(SANS_B, 22), fill=coul)
    y += 46

    f = font(SERIF_B, 74 if cle == "4-confiance" else 78)
    for ligne in wrap(d, c["titre"], f, 940):
        d.text((M, y), ligne, font=f, fill=TEXT)
        y += int(f.size * 1.14)

    if c.get("sous"):
        y += 24
        fb = font(SANS, 29)
        for ligne in wrap(d, c["sous"], fb, 920):
            d.text((M, y), ligne, font=fb, fill=MUTED)
            y += 44

    if c.get("puces_courtes"):
        y += 34
        for t in c["puces_courtes"]:
            check(d, M + 20, y + 16, 20)
            d.text((M + 58, y), t, font=font(SANS, 28), fill=TEXT)
            y += 56

    if c.get("encart"):
        y += 30
        gros, titre, sous = c["encart"]
        d.rounded_rectangle([M, y, W - M, y + 176], radius=22, fill=CARD,
                            outline=(28, 46, 64), width=2)
        d.text((M + 40, y + 30), gros, font=font(SERIF_B, 92), fill=GOLD)
        d.text((M + 140, y + 50), titre, font=font(SANS_B, 32), fill=TEXT)
        d.text((M + 140, y + 98), sous, font=font(SANS, 24), fill=MUTED)

    if c.get("cartes"):
        y += 30
        for i, (t, s) in enumerate(c["cartes"]):
            x = M + i * 480
            d.rounded_rectangle([x, y, x + 456, y + 132], radius=20, fill=CARD2,
                                outline=(28, 46, 64), width=2)
            d.text((x + 32, y + 32), t, font=font(SANS_B, 30), fill=GOLD2)
            d.text((x + 32, y + 76), s, font=font(SANS, 26), fill=MUTED)

    if c.get("items"):
        y += 26
        for t, s in c["items"]:
            d.rounded_rectangle([M, y, W - M, y + 118], radius=20, fill=CARD,
                                outline=(28, 46, 64), width=2)
            check(d, M + 52, y + 59, 20)
            d.text((M + 104, y + 26), t, font=font(SANS_B, 30), fill=TEXT)
            d.text((M + 104, y + 68), s, font=font(SANS, 24), fill=MUTED)
            y += 138

    d.text((M, H - 148), "LOUER  ·  PUBLIER  ·  GÉRER", font=font(SANS, 21), fill=DIM)
    cta(d, M, H - 112, 36)
    return vignette(img, 90)


# ═══════════════ AVEC PHOTO — personnage ═══════════════
def photo_carre(src, sur, titre, sous, puces=None, encart=None, fx=0.62, fy=0.42, voile=0.28):
    W = H = 1080
    img = Image.new("RGB", (W, H), NAVY)
    photo = cover(src, 560, H, fx, fy)
    mask = Image.new("L", (560, H), 255)
    md = ImageDraw.Draw(mask)
    for i in range(250):
        md.line([(i, 0), (i, H)], fill=int(255 * (i / 250) ** 1.4))
    img.paste(photo, (W - 560, 0), mask)
    veil = Image.new("RGB", (560, H), NAVY)
    img.paste(Image.blend(img.crop((W - 560, 0, W, H)), veil, voile), (W - 560, 0))

    d = ImageDraw.Draw(img)
    badge(d, 68, 66, 68)
    wordmark(d, 152, 86, 30)
    d.text((68, 250), "   ".join(sur), font=font(SANS_B, 20), fill=GOLD)

    y = 296
    f = font(SERIF_B, 58)
    for ligne in wrap(d, titre, f, 470):
        d.text((68, y), ligne, font=f, fill=TEXT)
        y += 68

    y += 16
    fb = font(SANS, 25)
    for ligne in wrap(d, sous, fb, 455):
        d.text((68, y), ligne, font=fb, fill=MUTED)
        y += 38

    if puces:
        y += 26
        for t in puces:
            check(d, 84, y + 16, 16)
            ft = font(SANS, 24)
            for i, ligne in enumerate(wrap(d, t, ft, 400)):
                d.text((110, y + i * 32), ligne, font=ft, fill=TEXT)
            y += 32 * len(wrap(d, t, ft, 400)) + 16

    if encart:
        y += 24
        gros, t1, t2 = encart
        d.rounded_rectangle([68, y, 560, y + 150], radius=20, fill=CARD,
                            outline=(28, 46, 64), width=2)
        d.text((100, y + 22), gros, font=font(SERIF_B, 78), fill=GOLD)
        d.text((178, y + 38), t1, font=font(SANS_B, 27), fill=TEXT)
        d.text((178, y + 80), t2, font=font(SANS, 22), fill=MUTED)

    cta(d, 68, H - 132, 34)
    return img


def photo_story(src, sur, titre, sous, puces=None, encart=None, fx=0.58, fy=0.42, voile=0.24):
    W, H = 1080, 1920
    img = Image.new("RGB", (W, H), NAVY)
    photo = cover(src, W, 940, fx, fy)
    mask = Image.new("L", (W, 940), 255)
    md = ImageDraw.Draw(mask)
    for i in range(320):
        md.line([(0, 940 - i), (W, 940 - i)], fill=int(255 * (i / 320) ** 1.5))
    img.paste(photo, (0, 0), mask)
    veil = Image.new("RGB", (W, 940), NAVY)
    img.paste(Image.blend(img.crop((0, 0, W, 940)), veil, voile), (0, 0))

    d = ImageDraw.Draw(img)
    badge(d, 76, 74, 84)
    wordmark(d, 180, 100, 34)

    y = 1010
    d.text((76, y), "   ".join(sur), font=font(SANS_B, 24), fill=GOLD)
    y += 52

    f = font(SERIF_B, 84)
    for ligne in wrap(d, titre, f, 930):
        d.text((76, y), ligne, font=f, fill=TEXT)
        y += 96

    y += 22
    fb = font(SANS, 34)
    for ligne in wrap(d, sous, fb, 900):
        d.text((76, y), ligne, font=fb, fill=MUTED)
        y += 52

    if puces:
        y += 30
        for t in puces:
            check(d, 98, y + 20, 20)
            ft = font(SANS, 32)
            for i, ligne in enumerate(wrap(d, t, ft, 830)):
                d.text((136, y + i * 42), ligne, font=ft, fill=TEXT)
            y += 42 * len(wrap(d, t, ft, 830)) + 18

    if encart:
        y += 26
        gros, t1, t2 = encart
        d.rounded_rectangle([76, y, 1004, y + 196], radius=24, fill=CARD,
                            outline=(28, 46, 64), width=2)
        d.text((124, y + 30), gros, font=font(SERIF_B, 104), fill=GOLD)
        d.text((232, y + 52), t1, font=font(SANS_B, 36), fill=TEXT)
        d.text((232, y + 108), t2, font=font(SANS, 27), fill=MUTED)

    d.text((76, H - 200), "LOUER  ·  PUBLIER  ·  GÉRER", font=font(SANS, 25), fill=DIM)
    cta(d, 76, H - 156, 42)
    return img


# ═══════════════ MAISON — photo pleine image ═══════════════
def voile_bas(img, debut, fin, pic=0.90):
    """Transition douce puis palier opaque : sans le palier, le texte
    restait illisible sur une façade claire."""
    W, H = img.size
    ov = Image.new("RGB", (W, H), NAVY)
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    span = max(1, fin - debut)
    haut = int(255 * pic)
    for y in range(debut, H):
        v = int(haut * ((y - debut) / span) ** 1.4) if y < fin else haut
        md.line([(0, y), (W, y)], fill=v)
    img.paste(ov, (0, 0), mask)
    return img


def maison(carre=True):
    src = Image.open(os.path.join(SRC, "maison1.jpg")).convert("RGB")
    W, H = (1080, 1080) if carre else (1080, 1920)
    M = 68 if carre else 76
    im = cover(src, W, H, 0.5, 0.42 if carre else 0.38)
    im = ImageEnhance.Color(im).enhance(0.85)
    im = ImageEnhance.Brightness(im).enhance(0.92)
    img = Image.blend(im, Image.new("RGB", (W, H), NAVY), 0.16)
    img = voile_bas(img, 300 if carre else 700, 560 if carre else 1090)

    d = ImageDraw.Draw(img)
    badge(d, M, 66 if carre else 74, 68 if carre else 84)
    wordmark(d, M + 84 if carre else M + 104, 86 if carre else 100, 30 if carre else 34)

    y = 560 if carre else 1120
    d.text((M, y), "   ".join("237LOGEMENT.ORG"), font=font(SANS_B, 20 if carre else 24), fill=GOLD)
    y += 46 if carre else 58

    f = font(SERIF_B, 66 if carre else 92)
    for ligne in wrap(d, "Votre bien idéal au Cameroun.", f, 900 if carre else 930):
        d.text((M, y), ligne, font=f, fill=TEXT)
        y += 78 if carre else 106

    y += 12 if carre else 18
    fb = font(SANS, 26 if carre else 34)
    sous = ("Yaoundé, Douala, Bafoussam, Kribi. Des annonces vérifiées, "
            "en contact direct avec l'annonceur.")
    for ligne in wrap(d, sous, fb, 880 if carre else 900):
        d.text((M, y), ligne, font=fb, fill=MUTED)
        y += 40 if carre else 52

    y += 22 if carre else 30
    fs = font(SANS_B, 24 if carre else 30)
    x = M
    for t in ["Contact direct", "Aucune commission"]:
        pad = 44 if carre else 54
        h = 52 if carre else 64
        d.rounded_rectangle([x, y, x + w_of(d, t, fs) + pad, y + h],
                            radius=h // 2, outline=GOLD, width=2)
        d.text((x + pad // 2, y + h // 2 - h_of(d, t, fs) / 2 - 3), t, font=fs, fill=GOLD)
        x += w_of(d, t, fs) + pad + 16

    if not carre:
        d.text((M, H - 200), "LOUER  ·  PUBLIER  ·  GÉRER", font=font(SANS, 25), fill=DIM)
    cta(d, M, H - (132 if carre else 156), 34 if carre else 42)
    return img


# ═══════════════ GÉNÉRATION ═══════════════
def save(img, nom):
    p = os.path.join(OUT, nom)
    img.save(p, "PNG", optimize=True)
    print("OK", nom, os.path.getsize(p) // 1024, "Ko")


for cle in CONTENUS:
    save(story_typo(cle), f"237logement-story-{cle}.png")
    save(carre_typo(cle), f"237logement-carre-{cle}.png")

homme = Image.open(os.path.join(SRC, "homme.jpg")).convert("RGB")
femme = duotone(Image.open(os.path.join(SRC, "femme.jpg")).convert("RGB"))

L = CONTENUS["1-locataires"]
save(photo_carre(homme, L["sur"], "Trouvez votre logement en contact direct.",
                 "Votre ville, votre budget, les vraies photos. Et votre interlocuteur au bout du fil.",
                 puces=L["puces_courtes"]),
     "237logement-photo-locataires-carre.png")
save(photo_story(homme, L["sur"], "Trouvez votre logement en contact direct.",
                 "Votre ville, votre budget, les vraies photos. Et votre interlocuteur au bout du fil.",
                 puces=L["puces_courtes"]),
     "237logement-photo-locataires-story.png")

P = CONTENUS["2-proprietaires"]
save(photo_carre(femme, P["sur"], "Votre bien est vide ?",
                 "Publiez-le gratuitement en cinq minutes. Vous recevez les demandes directement.",
                 encart=P["encart"], fx=0.72, fy=0.30, voile=0.07),
     "237logement-photo-proprietaires-carre.png")
save(photo_story(femme, P["sur"], "Votre bien est vide ?",
                 "Publiez-le gratuitement en cinq minutes et recevez les demandes directement.",
                 encart=P["encart"], fx=0.60, fy=0.24, voile=0.07),
     "237logement-photo-proprietaires-story.png")

save(maison(True), "237logement-maison-carre.png")
save(maison(False), "237logement-maison-story.png")
