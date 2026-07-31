import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Home, BedDouble, Car, MapPin, Lock, Search, Plus, Phone, X,
  CheckCircle2, HelpCircle, Copy, ArrowRight,
  ShieldCheck, ChevronDown, KeyRound, ListChecks, Loader2, Info, Building2,
  ImagePlus, Trash2, BadgeCheck, Smartphone, Sparkles, ImageOff, ExternalLink,
  LogOut, UploadCloud, UserCog, ShieldQuestion, Mail, KeySquare, Package, MessageCircleQuestion,
} from "lucide-react";
import { supabase } from "./supabaseClient.js";

/* ---------- Design tokens ---------- */
const C = {
  ink: "#16233F",
  inkSoft: "#1F3358",
  paper: "#F6F3EC",
  card: "#FFFFFF",
  gold: "#B8863B",
  green: "#2F6F4E",
  rust: "#A24936",
  slate: "#5B6472",
  line: "#C9C2B0",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
  @keyframes stampIn {
    0% { opacity: 0; transform: scale(2.1) rotate(-12deg); }
    60% { opacity: 1; transform: scale(0.94) rotate(-5deg); }
    100% { opacity: 1; transform: scale(1) rotate(-3deg); }
  }
  .stamp-reveal { animation: stampIn 0.45s cubic-bezier(.2,.8,.3,1.2); }
  .clesch-focus:focus-visible { outline: 2px solid #B8863B; outline-offset: 2px; }
  .clesch-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;

/* Accurate Schengen area, July 2026: EU members + Iceland, Norway, Switzerland,
   Liechtenstein. Bulgaria and Romania are included (fully joined 2024). */
const COUNTRIES = [
  "Allemagne", "Autriche", "Belgique", "Bulgarie", "Croatie", "Danemark",
  "Espagne", "Estonie", "Finlande", "France", "Grèce", "Hongrie", "Islande",
  "Italie", "Lettonie", "Liechtenstein", "Lituanie", "Luxembourg", "Malte",
  "Norvège", "Pays-Bas", "Pologne", "Portugal", "République tchèque",
  "Roumanie", "Slovaquie", "Slovénie", "Suède", "Suisse",
];

const TYPES = {
  maison: { label: "Maison", icon: Home },
  chambre: { label: "Chambre", icon: BedDouble },
  voiture: { label: "Voiture", icon: Car },
  appareils: { label: "Appareils", icon: Package },
};

const TRANSACTIONS = {
  location: { label: "Location", unit: { maison: "/mois", chambre: "/mois", voiture: "/jour", appareils: "/jour" } },
  vente: { label: "Vente", unit: { maison: "", chambre: "", voiture: "", appareils: "" } },
};

const UNLOCK_FEE = 2.99;


const MAX_PHOTOS = 4;

const PLANS = [
  {
    key: "weekly",
    label: "Hebdomadaire",
    tagline: "Pour tester la visibilité sur une annonce ponctuelle.",
    url: "https://buy.stripe.com/7sYfZg0CBgwQ7Qu3uWcMM00",
  },
  {
    key: "monthly",
    label: "Mensuel",
    tagline: "Le choix le plus courant pour un propriétaire actif.",
    url: "https://buy.stripe.com/7sYeVcdpngwQ7Quc1scMM01",
  },
  {
    key: "yearly",
    label: "Annuel",
    tagline: "Le tarif le plus avantageux pour une présence continue.",
    url: "https://buy.stripe.com/cNieVc2KJ6Wg4Ei9TkcMM02",
  },
];

/* Reads an image file, downsizes it, and returns a compact JPEG data URL.
   Keeps listing photos small enough to store as plain text in the shared database. */
function resizeImageFile(file, maxDim = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("image_load_failed"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function genOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/* ---------- Small building blocks ---------- */
function Badge({ children, tone = "ink" }) {
  const bg = tone === "green" ? C.green : C.inkSoft;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ background: bg }}>
      {children}
    </span>
  );
}

function formatPrice(p) {
  return Number(p).toLocaleString("fr-FR");
}

function Select({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange}
        className="clesch-focus appearance-none rounded-lg border py-2 pl-3 pr-8 text-sm outline-none"
        style={{ borderColor: C.line, color: C.ink, background: C.card }}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
    </div>
  );
}

/* ---------- Ticket-style listing card ---------- */
function ListingCard({ listing, unlocked, onOpen }) {
  const TypeIcon = TYPES[listing.type].icon;
  const unit = TRANSACTIONS[listing.transaction].unit[listing.type];
  const cover = listing.photos && listing.photos[0];
  return (
    <div className="relative flex overflow-hidden rounded-xl shadow-sm transition hover:shadow-md" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex-1 p-4">
        <div className="flex gap-3">
          {cover ? (
            <img src={cover} alt="" className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" style={{ border: `1px solid ${C.line}` }} />
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <TypeIcon size={22} style={{ color: C.slate }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5" style={{ color: C.inkSoft }}>
                <TypeIcon size={15} />
                <span className="text-sm font-semibold">{TYPES[listing.type].label}</span>
                {listing.verified && <BadgeCheck size={14} style={{ color: C.green }} />}
              </div>
            </div>
            <Badge tone={listing.transaction === "vente" ? "green" : "ink"}>
              {TRANSACTIONS[listing.transaction].label}
            </Badge>
            <div className="mt-1.5 flex items-center gap-1 text-sm" style={{ color: C.slate }}>
              <MapPin size={13} />
              <span>{listing.neighborhood ? `${listing.neighborhood}, ` : ""}{listing.city}, {listing.country}</span>
            </div>
          </div>
        </div>

        <p className="clesch-clamp mt-3 text-sm leading-snug" style={{ color: C.ink }}>
          {listing.desc}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
            {formatPrice(listing.price)} €
          </span>
          {unit && <span className="text-xs" style={{ color: C.slate }}>{unit}</span>}
        </div>

        <p className="mt-1 tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.slate, fontSize: "11px" }}>
          RÉF. {listing.id}
        </p>
      </div>

      <div className="relative w-0" style={{ borderLeft: `2px dashed ${C.line}` }}>
        <span className="absolute h-4 w-4 rounded-full" style={{ background: C.paper, top: "-8px", left: "-9px" }} />
        <span className="absolute h-4 w-4 rounded-full" style={{ background: C.paper, bottom: "-8px", left: "-9px" }} />
      </div>

      <button
        onClick={() => onOpen(listing)}
        className="clesch-focus flex w-24 flex-col items-center justify-center gap-1.5 p-3 text-center transition hover:brightness-110"
        style={{ background: unlocked ? C.green : C.ink }}
      >
        {unlocked ? <CheckCircle2 size={18} color="white" /> : <Lock size={18} color="white" />}
        <span className="font-medium leading-tight text-white" style={{ fontSize: "11px" }}>
          {unlocked ? "Débloqué" : "Voir"}
        </span>
      </button>
    </div>
  );
}

/* ---------- Detail + payment modal ---------- */
function ListingModal({ listing, unlocked, session, onClose, onUnlock, onRequireAuth }) {
  const [stage, setStage] = useState(unlocked ? "revealed" : "detail");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const TypeIcon = TYPES[listing.type].icon;
  const unit = TRANSACTIONS[listing.transaction].unit[listing.type];

  async function startCheckout() {
    if (!session) {
      onClose();
      onRequireAuth();
      return;
    }
    setError("");
    setStage("processing");
    try {
      await onUnlock(listing.id);
      // onUnlock redirects the browser to Stripe — if we're still here, it failed.
    } catch (err) {
      setError(err.message || "Impossible de démarrer le paiement, réessaie.");
      setStage("detail");
    }
  }

  function copyPhone() {
    navigator.clipboard?.writeText(listing.phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-md overflow-y-auto rounded-2xl shadow-xl" style={{ background: C.card, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4" style={{ background: C.ink }}>
          <div className="flex items-center gap-2 text-white">
            <TypeIcon size={18} />
            <span className="text-sm font-semibold">{TYPES[listing.type].label} · {TRANSACTIONS[listing.transaction].label}</span>
          </div>
          <button onClick={onClose} className="clesch-focus hover:text-white" style={{ color: "rgba(255,255,255,0.8)" }}><X size={18} /></button>
        </div>

        <div className="p-5">
          {listing.photos && listing.photos.length > 0 ? (
            <div className="mb-4">
              <img src={listing.photos[0]} alt="" className="h-48 w-full rounded-lg object-cover" style={{ border: `1px solid ${C.line}` }} />
              {listing.photos.length > 1 && (
                <div className="mt-2 flex gap-2">
                  {listing.photos.slice(1, 4).map((p, i) => (
                    <img key={i} src={p} alt="" className="h-14 w-14 rounded-lg object-cover" style={{ border: `1px solid ${C.line}` }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 flex h-32 items-center justify-center gap-2 rounded-lg text-xs" style={{ background: C.paper, border: `1px dashed ${C.line}`, color: C.slate }}>
              <ImageOff size={16} /> Aucune photo fournie pour cette annonce
            </div>
          )}

          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
              {listing.neighborhood ? `${listing.neighborhood}, ` : ""}{listing.city}, {listing.country}
            </h3>
            {listing.verified && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#EAF3EE", color: C.green }}>
                <BadgeCheck size={12} /> Propriétaire vérifié
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.slate }}>
            RÉF. {listing.id}
          </p>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: C.ink }}>{listing.desc}</p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
              {formatPrice(listing.price)} €
            </span>
            {unit && <span className="text-sm" style={{ color: C.slate }}>{unit}</span>}
          </div>

          <div className="my-5 border-t" style={{ borderColor: C.line }} />

          {stage === "detail" && (
            <div className="rounded-xl p-4 text-center" style={{ background: C.paper, border: `1px dashed ${C.line}` }}>
              <Lock size={20} className="mx-auto" style={{ color: C.slate }} />
              <p className="mt-2 text-sm" style={{ color: C.slate }}>
                Le nom et le numéro du propriétaire sont masqués. Débloque ses coordonnées pour le contacter directement.
              </p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs" style={{ color: C.green }}>
                <ShieldCheck size={13} /> Paiement réel et sécurisé via Stripe
              </p>
              {error && <p className="mt-2 text-xs" style={{ color: C.rust }}>{error}</p>}
              <button
                onClick={startCheckout}
                className="clesch-focus mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: C.gold }}
              >
                <KeyRound size={16} /> Débloquer le contact — {UNLOCK_FEE.toFixed(2)} €
              </button>
              {!session && (
                <p className="mt-2 text-xs" style={{ color: C.slate }}>Un compte est nécessaire pour payer et retrouver ce contact ensuite.</p>
              )}
            </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-2 py-6">
              <Loader2 size={22} className="animate-spin" style={{ color: C.gold }} />
              <p className="text-sm" style={{ color: C.slate }}>Redirection vers le paiement sécurisé Stripe…</p>
            </div>
          )}

          {stage === "revealed" && (
            <div className="stamp-reveal rounded-xl p-4" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2" style={{ color: C.green }}>
                <CheckCircle2 size={16} />
                <span className="text-sm font-semibold">Contact débloqué</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: C.ink }}>
                <Building2 size={15} />
                <span className="font-semibold">{listing.owner}</span>
              </div>
              <div className="mt-1 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <span className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.ink }}>{listing.phone}</span>
                <button onClick={copyPhone} className="clesch-focus" style={{ color: C.slate }}><Copy size={15} /></button>
              </div>
              {copied && <p className="mt-1 text-xs" style={{ color: C.green }}>Numéro copié.</p>}
              <a href={`tel:${listing.phone.replace(/\s/g, "")}`} className="clesch-focus mt-3 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: C.green }}>
                <Phone size={15} /> Appeler {listing.owner.split(" ")[0]}
              </a>
              <p className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: C.slate }}>
                <Info size={12} /> Retrouve ce contact dans l'onglet « Mes contacts », même après avoir fermé l'application.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Add listing form ---------- */
function AddListingForm({ onSubmit, saving }) {
  const empty = { owner: "", phone: "", type: "maison", transaction: "location", country: COUNTRIES[0], city: "", neighborhood: "", price: "", desc: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [saveError, setSaveError] = useState(false);
  const fileInputRef = useRef(null);

  // Photos
  const [photos, setPhotos] = useState([]); // array of data URLs
  const [photoError, setPhotoError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  // Phone verification (simulated OTP — see note below)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verified, setVerified] = useState(false);

  // Anti-robot check (demo widget — see note below)
  const [robotChecking, setRobotChecking] = useState(false);
  const [robotChecked, setRobotChecked] = useState(false);

  const [gateError, setGateError] = useState("");

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "phone") {
      setVerified(false);
      setOtpSent(false);
      setOtpInput("");
      setOtpError("");
    }
  }

  async function handlePhotoFiles(fileList) {
    const files = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);
    if (files.length === 0) return;
    setPhotoError("");
    setPhotoBusy(true);
    try {
      const next = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await resizeImageFile(file);
        next.push(dataUrl);
      }
      setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
    } catch {
      setPhotoError("Une des images n'a pas pu être chargée. Réessaie avec une autre photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto(i) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  function sendOtp() {
    if (!form.phone.trim()) {
      setOtpError("Renseigne d'abord ton numéro de téléphone.");
      return;
    }
    setOtpError("");
    setOtpCode(genOtp());
    setOtpSent(true);
    setOtpInput("");
  }

  function confirmOtp() {
    if (otpInput.trim() === otpCode) {
      setVerified(true);
      setOtpError("");
    } else {
      setOtpError("Code incorrect. Vérifie et réessaie.");
    }
  }

  function toggleRobot() {
    if (robotChecked) { setRobotChecked(false); return; }
    setRobotChecking(true);
    setTimeout(() => { setRobotChecking(false); setRobotChecked(true); }, 550);
  }

  function validate() {
    const e = {};
    if (!form.owner.trim()) e.owner = "Indique ton nom.";
    if (!form.phone.trim()) e.phone = "Indique un numéro joignable.";
    if (!form.city.trim()) e.city = "Indique la ville.";
    if (!form.neighborhood.trim()) e.neighborhood = "Indique le quartier.";
    if (!form.price || Number(form.price) <= 0) e.price = "Indique un prix valide.";
    if (!form.desc.trim()) e.desc = "Ajoute une courte description.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setGateError("");
    if (!validate()) return;
    if (!verified) {
      setGateError("Vérifie ton numéro de téléphone avant de publier.");
      return;
    }
    if (!robotChecked) {
      setGateError("Coche la case anti-robot avant de publier.");
      return;
    }
    const id = "SCH-" + Date.now().toString(36).toUpperCase().slice(-5);
    const listing = { id, ...form, price: Number(form.price), verified: true, photos };
    setSaveError(false);
    const ok = await onSubmit(listing);
    if (ok) {
      setSuccess(id);
      setForm(empty);
      setPhotos([]);
      setVerified(false);
      setOtpSent(false);
      setRobotChecked(false);
    } else {
      setSaveError(true);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Publier une annonce</h2>
      <p className="mt-1 text-sm" style={{ color: C.slate }}>
        Ton numéro reste masqué sur la plateforme. Il n'est révélé qu'aux personnes ayant payé pour le débloquer.
      </p>

      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: "#EAF3EE", color: C.green }}>
          <CheckCircle2 size={16} /> Annonce publiée avec la référence <strong>&nbsp;{success}</strong>. Retrouve-la dans « Rechercher ».
        </div>
      )}
      {saveError && (
        <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: "#F7EAE6", color: C.rust }}>
          La sauvegarde a échoué — vérifie ta connexion et réessaie. Ton annonce n'a pas été publiée.
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>Ton nom</label>
          <input value={form.owner} onChange={(e) => set("owner", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.owner ? C.rust : C.line }} placeholder="Nom et prénom" />
          {errors.owner && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.owner}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>Numéro de téléphone</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.phone ? C.rust : C.line }} placeholder="+33 6 12 34 56 78" />
          {errors.phone && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.phone}</p>}
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>Type de bien</label>
          <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>Type d'annonce</label>
          <Select value={form.transaction} onChange={(e) => set("transaction", e.target.value)}>
            {Object.entries(TRANSACTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>Pays (espace Schengen)</label>
          <Select value={form.country} onChange={(e) => set("country", e.target.value)}>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>Ville</label>
          <input value={form.city} onChange={(e) => set("city", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.city ? C.rust : C.line }} placeholder="ex. Lyon" />
          {errors.city && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.city}</p>}
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>Quartier</label>
          <input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.neighborhood ? C.rust : C.line }} placeholder="ex. Croix-Rousse" />
          {errors.neighborhood && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.neighborhood}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>
            Prix (€ {TRANSACTIONS[form.transaction].unit[form.type] || "total"})
          </label>
          <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.price ? C.rust : C.line }} placeholder="ex. 850" />
          {errors.price && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.price}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>Description</label>
          <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={3}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.desc ? C.rust : C.line }} placeholder="Décris le bien, sa disponibilité, ses conditions…" />
          {errors.desc && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.desc}</p>}
        </div>

        {/* Photos */}
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>Photos du bien (jusqu'à {MAX_PHOTOS})</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative h-16 w-16">
                <img src={p} alt="" className="h-16 w-16 rounded-lg object-cover" style={{ border: `1px solid ${C.line}` }} />
                <button onClick={() => removePhoto(i)} className="clesch-focus absolute -right-1.5 -top-1.5 rounded-full p-0.5" style={{ background: C.rust }}>
                  <Trash2 size={11} color="white" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoBusy}
                className="clesch-focus flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg text-xs"
                style={{ border: `1px dashed ${C.line}`, color: C.slate, background: C.paper }}
              >
                {photoBusy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                Ajouter
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden
              onChange={(e) => { handlePhotoFiles(e.target.files); e.target.value = ""; }} />
          </div>
          <p className="mt-1 text-xs" style={{ color: C.slate }}>
            Les photos sont compressées automatiquement pour rester légères. Formats JPG/PNG.
          </p>
          {photoError && <p className="mt-1 text-xs" style={{ color: C.rust }}>{photoError}</p>}
        </div>

        {/* Phone verification */}
        <div className="col-span-2 rounded-lg p-3.5" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: C.ink }}>
            <Smartphone size={15} /> Vérification du propriétaire
          </div>

          {verified ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: C.green }}>
              <BadgeCheck size={15} /> Numéro vérifié — ton annonce portera le badge « Propriétaire vérifié ».
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs" style={{ color: C.slate }}>
                Confirme que tu es bien joignable à ce numéro avant de publier.
              </p>
              {!otpSent ? (
                <button onClick={sendOtp} className="clesch-focus mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: C.ink }}>
                  Envoyer un code par SMS
                </button>
              ) : (
                <div className="mt-2">
                  <p className="rounded-md p-2 text-xs" style={{ background: "#FFF7E8", color: "#8a6a2f" }}>
                    Code envoyé (démo) : <strong>{otpCode}</strong> — en production, ce code serait envoyé par SMS via un vrai prestataire (Twilio, Vonage…), jamais affiché à l'écran.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Code reçu"
                      className="clesch-focus w-28 rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ borderColor: C.line }} />
                    <button onClick={confirmOtp} className="clesch-focus rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: C.gold }}>
                      Confirmer
                    </button>
                    <button onClick={sendOtp} className="clesch-focus text-xs" style={{ color: C.slate }}>Renvoyer</button>
                  </div>
                  {otpError && <p className="mt-1 text-xs" style={{ color: C.rust }}>{otpError}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Anti-robot check */}
        <div className="col-span-2 flex items-center gap-3 rounded-lg p-3.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <button
            onClick={toggleRobot}
            className="clesch-focus flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
            style={{ border: `1.5px solid ${robotChecked ? C.green : C.line}`, background: robotChecked ? C.green : "transparent" }}
            aria-pressed={robotChecked}
          >
            {robotChecking ? <Loader2 size={13} className="animate-spin" style={{ color: C.slate }} /> : robotChecked ? <CheckCircle2 size={14} color="white" /> : null}
          </button>
          <div>
            <p className="text-sm font-medium" style={{ color: C.ink }}>Je ne suis pas un robot</p>
            <p className="text-xs" style={{ color: C.slate }}>Vérification anti-robot (démo) — un vrai service utiliserait reCAPTCHA, hCaptcha ou Cloudflare Turnstile.</p>
          </div>
        </div>
      </div>

      {gateError && <p className="mt-3 text-sm" style={{ color: C.rust }}>{gateError}</p>}

      <button onClick={handleSubmit} disabled={saving}
        className="clesch-focus mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
        style={{ background: C.ink, opacity: saving ? 0.6 : 1 }}>
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {saving ? "Publication…" : "Publier l'annonce"}
      </button>
    </div>
  );
}

/* ---------- Dedicated onboarding tab ---------- */
function HowItWorks({ goTo }) {
  const steps = [
    { n: "01", title: "Le propriétaire publie", body: "Le propriétaire d'une maison, d'une chambre ou d'une voiture dépose son annonce : ville, pays de l'espace Schengen, prix et description. Son numéro reste masqué." },
    { n: "02", title: "Le client cherche et choisit", body: "Une personne intéressée filtre les annonces par type, transaction et pays, puis ouvre celle qui lui convient. Le contact du propriétaire reste scellé tant qu'il n'a pas payé." },
    { n: "03", title: "Le client paie pour être mis en contact", body: `En réglant ${UNLOCK_FEE.toFixed(2)} € de frais de mise en relation, le nom et le numéro du propriétaire sont débloqués immédiatement, pour appeler et décider soi-même.` },
  ];
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Mode d'emploi</p>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
        Comment fonctionne la mise en relation
      </h1>
      <p className="mt-3 max-w-2xl text-sm" style={{ color: C.slate }}>
        CléSchengen connecte les propriétaires de biens en location ou en vente dans l'espace Schengen avec des
        personnes qui cherchent un logement ou une voiture. Le contact n'est jamais visible gratuitement : il faut
        passer par l'étape de paiement pour l'obtenir.
      </p>

      <div className="mt-6 space-y-3">
        {steps.map((s) => (
          <div key={s.n} className="flex gap-4 rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.gold }}>{s.n}</div>
            <div>
              <div className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{s.title}</div>
              <div className="mt-0.5 text-sm" style={{ color: C.slate }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => goTo("browse")} className="clesch-focus flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: C.ink }}>
          Parcourir les annonces <ArrowRight size={15} />
        </button>
        <button onClick={() => goTo("add")} className="clesch-focus flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold" style={{ background: C.card, border: `1px solid ${C.ink}`, color: C.ink }}>
          Je suis propriétaire, je publie <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Auth (login / signup) ---------- */
function AuthModal({ mode: initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("chercheur");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } },
        });
        if (err) throw err;
        setNotice("Compte créé. Si la confirmation par e-mail est activée, vérifie ta boîte mail avant de te connecter.");
        setMode("login");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onClose();
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
            {mode === "login" ? "Se connecter" : "Créer un compte"}
          </h3>
          <button onClick={onClose} className="clesch-focus" style={{ color: C.slate }}><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-2.5">
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>E-mail</label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="clesch-focus w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none" style={{ borderColor: C.line }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>Mot de passe</label>
            <div className="relative mt-1">
              <KeySquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="clesch-focus w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none" style={{ borderColor: C.line }} />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium" style={{ color: C.slate }}>Je suis…</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole("chercheur")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: role === "chercheur" ? C.gold : C.line, background: role === "chercheur" ? "#FBF3E7" : "transparent", color: C.ink }}>
                  À la recherche d'un bien
                </button>
                <button type="button" onClick={() => setRole("bailleur")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: role === "bailleur" ? C.gold : C.line, background: role === "bailleur" ? "#FBF3E7" : "transparent", color: C.ink }}>
                  Propriétaire / vendeur
                </button>
              </div>
              {role === "bailleur" && (
                <p className="mt-1.5 text-xs" style={{ color: C.slate }}>
                  Une vérification d'identité sera demandée avant de pouvoir publier une annonce.
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs" style={{ color: C.rust }}>{error}</p>}
          {notice && <p className="text-xs" style={{ color: C.green }}>{notice}</p>}

          <button disabled={busy} type="submit"
            className="clesch-focus mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: C.ink }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setNotice(""); }}
          className="clesch-focus mt-3 w-full text-center text-xs font-medium"
          style={{ color: C.gold }}
        >
          {mode === "login" ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Email link verification (free, unlimited, native Supabase Auth — click the link, no SMTP setup needed) ---------- */
function EmailVerification({ email, onVerified }) {
  const [stage, setStage] = useState("intro"); // intro | sent
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendLink() {
    setError("");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}${window.location.pathname}?verify_email=1`,
        },
      });
      if (err) throw err;
      setStage("sent");
    } catch (err) {
      setError(err.message || "Échec de l'envoi de l'e-mail, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2" style={{ color: C.ink }}>
        <Mail size={18} />
        <h3 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>Vérification par e-mail</h3>
      </div>
      <p className="mt-2 text-sm" style={{ color: C.slate }}>
        Avant d'envoyer ta pièce d'identité, confirme que tu as bien accès à <strong>{email}</strong>. Cette étape
        évite les faux comptes créés automatiquement.
      </p>

      {stage === "intro" && (
        <>
          {error && <p className="mt-2 text-xs" style={{ color: C.rust }}>{error}</p>}
          <button disabled={busy} onClick={sendLink}
            className="clesch-focus mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: C.ink }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : "Envoyer le lien de confirmation"}
          </button>
        </>
      )}

      {stage === "sent" && (
        <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "#EAF3EE", color: C.green }}>
          <CheckCircle2 size={16} className="mb-1" /> Un e-mail a été envoyé à {email}. Ouvre-le et clique sur le
          lien de confirmation — cette page se mettra à jour automatiquement dès que ce sera fait.
          <button onClick={sendLink} className="clesch-focus mt-2 flex text-xs underline" style={{ color: C.green }}>
            Renvoyer l'e-mail
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Identity verification gate for landlords/sellers ---------- */
function VerificationGate({ profile, userId, userEmail, onUpgradeRequested, onSubmitted, onEmailVerified }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (profile.role === "chercheur") {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <UserCog size={22} className="mx-auto" style={{ color: C.slate }} />
        <p className="mt-2 text-sm" style={{ color: C.slate }}>
          Ce compte est enregistré comme « à la recherche d'un bien ». Pour publier des annonces, passe ton compte
          en propriétaire/vendeur — une vérification d'identité sera ensuite demandée.
        </p>
        <button
          onClick={onUpgradeRequested}
          className="clesch-focus mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: C.gold }}
        >
          Devenir propriétaire / vendeur
        </button>
      </div>
    );
  }

  if (!profile.email_verified) {
    return <EmailVerification email={userEmail} onVerified={onEmailVerified} />;
  }

  if (profile.verification_status === "pending") {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <Loader2 size={22} className="mx-auto animate-spin" style={{ color: C.gold }} />
        <p className="mt-2 text-sm" style={{ color: C.slate }}>
          Ta pièce d'identité a été envoyée et est en cours de vérification manuelle. Tu pourras publier dès
          qu'elle sera validée.
        </p>
      </div>
    );
  }

  if (profile.verification_status === "verified") return null;

  async function submit() {
    if (!file) { setError("Choisis un fichier (photo ou PDF de ta pièce d'identité)."); return; }
    setBusy(true);
    setError("");
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("id-documents").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { error: rpcErr } = await supabase.rpc("submit_id_document", { document_path: path });
      if (rpcErr) throw rpcErr;
      onSubmitted();
    } catch (err) {
      setError(err.message || "L'envoi a échoué, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2" style={{ color: C.ink }}>
        <ShieldQuestion size={18} />
        <h3 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>Vérification d'identité requise</h3>
      </div>
      {profile.verification_status === "rejected" && (
        <div className="mt-2 rounded-lg p-3 text-sm" style={{ background: "#F7EAE6", color: C.rust }}>
          Ta précédente demande a été refusée{profile.rejection_reason ? ` : ${profile.rejection_reason}` : "."} Tu peux renvoyer un document.
        </div>
      )}
      <p className="mt-2 text-sm" style={{ color: C.slate }}>
        Envoie une photo ou un scan lisible d'une pièce d'identité (carte d'identité, passeport). Un membre de
        l'équipe vérifie manuellement chaque demande avant d'autoriser la publication d'annonces.
      </p>
      <label className="clesch-focus mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm" style={{ borderColor: C.line, color: C.slate }}>
        <UploadCloud size={16} />
        {file ? file.name : "Choisir un fichier"}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      {error && <p className="mt-2 text-xs" style={{ color: C.rust }}>{error}</p>}
      <button disabled={busy} onClick={submit}
        className="clesch-focus mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: C.ink }}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : "Envoyer pour vérification"}
      </button>
    </div>
  );
}

/* ---------- Admin moderation panel ---------- */
function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docUrls, setDocUrls] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, verification_status, id_document_path, created_at")
      .in("verification_status", ["pending", "rejected"])
      .order("created_at", { ascending: true });
    setPending(data || []);
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("id, email, message, created_at")
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setMessagesLoading(false);
  }, []);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadListingsAdmin = useCallback(async () => {
    setListingsLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("id, type, transaction, country, city, owner_name, phone, price, created_at")
      .order("created_at", { ascending: false });
    setListings(data || []);
    setListingsLoading(false);
  }, []);

  async function deleteListing(id) {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) return;
    setDeletingId(id);
    await supabase.from("listings").delete().eq("id", id);
    setDeletingId(null);
    loadListingsAdmin();
  }

  useEffect(() => { load(); loadMessages(); loadListingsAdmin(); }, [load, loadMessages, loadListingsAdmin]);

  async function viewDocument(row) {
    if (!row.id_document_path) return;
    const { data } = await supabase.storage.from("id-documents").createSignedUrl(row.id_document_path, 300);
    if (data?.signedUrl) setDocUrls((m) => ({ ...m, [row.id]: data.signedUrl }));
  }

  async function decide(id, email, verification_status) {
    setBusyId(id);
    const reason = verification_status === "rejected" ? (rejectReason[id] || "Document illisible ou non conforme.") : null;
    await supabase.from("profiles").update({
      verification_status,
      rejection_reason: reason,
    }).eq("id", id);
    await supabase.functions.invoke("send-verification-email", {
      body: { email, status: verification_status, reason },
    });
    setBusyId(null);
    load();
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Espace admin</p>
      <h1 className="mt-1 text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Vérifications en attente</h1>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> Chargement…</div>
      ) : pending.length === 0 ? (
        <div className="mt-4 rounded-xl border p-8 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          Aucune demande en attente.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {pending.map((row) => (
            <div key={row.id} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.ink }}>{row.email}</p>
                  <p className="text-xs" style={{ color: C.slate }}>Statut : {row.verification_status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewDocument(row)} className="clesch-focus rounded-lg border px-3 py-1.5 text-xs font-medium" style={{ borderColor: C.line, color: C.ink }}>
                    Voir le document
                  </button>
                  <button disabled={busyId === row.id} onClick={() => decide(row.id, row.email, "verified")}
                    className="clesch-focus rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ background: C.green }}>
                    Approuver
                  </button>
                  <button disabled={busyId === row.id} onClick={() => decide(row.id, row.email, "rejected")}
                    className="clesch-focus rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ background: C.rust }}>
                    Refuser
                  </button>
                </div>
              </div>
              <input
                placeholder="Motif de refus (optionnel)"
                value={rejectReason[row.id] || ""}
                onChange={(e) => setRejectReason((m) => ({ ...m, [row.id]: e.target.value }))}
                className="clesch-focus mt-2 w-full rounded-lg border px-3 py-1.5 text-xs outline-none"
                style={{ borderColor: C.line }}
              />
              {docUrls[row.id] && (
                <a href={docUrls[row.id]} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: C.gold }}>
                  Ouvrir le document <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Modération</p>
      <h2 className="mt-1 text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Annonces publiées</h2>

      {listingsLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> Chargement…</div>
      ) : listings.length === 0 ? (
        <div className="mt-3 rounded-xl border p-6 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          Aucune annonce publiée pour l'instant.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: C.ink }}>
                  {TYPES[l.type]?.label} · {TRANSACTIONS[l.transaction]?.label} — {l.city}, {l.country}
                </p>
                <p className="text-xs" style={{ color: C.slate }}>
                  {l.owner_name} · {l.phone} · {formatPrice(l.price)} € · réf. {l.id}
                </p>
              </div>
              <button disabled={deletingId === l.id} onClick={() => deleteListing(l.id)}
                className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ background: C.rust }}>
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Support</p>
      <h2 className="mt-1 text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Messages reçus</h2>

      {messagesLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> Chargement…</div>
      ) : messages.length === 0 ? (
        <div className="mt-3 rounded-xl border p-6 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          Aucun message pour l'instant.
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: C.ink }}>{m.email}</p>
                <p className="text-xs" style={{ color: C.slate }}>{new Date(m.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <p className="mt-1.5 text-sm" style={{ color: C.ink }}>{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Contact the admin (for support / difficulties) ---------- */
function ContactModal({ defaultEmail, onClose }) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !message.trim()) { setError("Renseigne ton e-mail et ton message."); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from("contact_messages").insert({
        user_id: user?.id || null,
        email: email.trim(),
        message: message.trim(),
      });
      if (err) throw err;
      // La sauvegarde du message est ce qui compte le plus : si l'e-mail de
      // notification échoue, le message reste quand même visible dans le
      // panneau admin, donc on n'échoue pas toute la soumission pour ça.
      supabase.functions.invoke("notify-contact-message", {
        body: { email: email.trim(), message: message.trim() },
      }).catch(() => {});
      setSent(true);
    } catch (err) {
      setError(err.message || "Échec de l'envoi, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Contactez-nous</h3>
          <button onClick={onClose} className="clesch-focus" style={{ color: C.slate }}><X size={18} /></button>
        </div>

        {sent ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-lg p-4 text-center text-sm" style={{ background: "#EAF3EE", color: C.green }}>
            <CheckCircle2 size={20} />
            Message envoyé. On te répond dès que possible à {email}.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-2.5">
            <p className="text-sm" style={{ color: C.slate }}>
              Une difficulté avec ton compte, un paiement ou une annonce ? Décris-la ici, on te répond par e-mail.
            </p>
            <div>
              <label className="text-xs font-medium" style={{ color: C.slate }}>Ton e-mail</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: C.slate }}>Message</label>
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
                className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }}
                placeholder="Décris ta difficulté…" />
            </div>
            {error && <p className="text-xs" style={{ color: C.rust }}>{error}</p>}
            <button disabled={busy} type="submit"
              className="clesch-focus mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: C.ink }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : "Envoyer le message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Main app ---------- */
export default function CleSchengen() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModal, setAuthModal] = useState(null); // null | "login" | "signup"
  const [contactOpen, setContactOpen] = useState(false);

  const [tab, setTab] = useState("how"); // how | browse | add | history | premium | admin

  const [listings, setListings] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  const [unlocked, setUnlocked] = useState({}); // listing id -> true
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fTrans, setFTrans] = useState("all");
  const [fCountry, setFCountry] = useState("all");

  /* ---- Auth: track session + load matching profile row ---- */
  const loadProfile = useCallback(async (uid) => {
    if (!uid) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile(data || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setAuthLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  async function signOut() {
    await supabase.auth.signOut();
    setTab("how");
  }

  /* ---- Shared listings (real Supabase table, same for every visitor) ---- */
  const loadListings = useCallback(async () => {
    setDbLoading(true);
    setDbError(false);
    const { data, error } = await supabase.rpc("public_listings");
    if (error) {
      setDbError(true);
      setListings([]);
    } else {
      setListings(
        (data || []).map((l) => ({
          id: l.id,
          type: l.type,
          transaction: l.transaction,
          country: l.country,
          city: l.city,
          neighborhood: l.neighborhood,
          price: l.price,
          owner: l.owner_name,
          phone: l.phone,
          desc: l.description,
          verified: true,
          photos: l.photos || [],
          ownerId: l.owner_id,
          contactVisible: l.phone !== null,
        }))
      );
    }
    setDbLoading(false);
  }, []);

  /* ---- This visitor's own unlocks (tied to their account, not the browser) ---- */
  const loadUnlocks = useCallback(async (uid) => {
    if (!uid) { setUnlocked({}); return; }
    const { data } = await supabase.from("unlocks").select("listing_id").eq("user_id", uid);
    const map = {};
    (data || []).forEach((r) => (map[r.listing_id] = true));
    setUnlocked(map);
  }, []);

  /* ---- Active Premium subscription (grants free unlocks + skips landlord verification) ---- */
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const loadSubscription = useCallback(async (uid) => {
    if (!uid) { setHasActiveSubscription(false); return; }
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", uid)
      .maybeSingle();
    setHasActiveSubscription(!!data && data.status === "active" && new Date(data.current_period_end) > new Date());
  }, []);

  useEffect(() => { loadListings(); }, [loadListings]);
  useEffect(() => { loadUnlocks(session?.user?.id); }, [session, loadUnlocks]);
  useEffect(() => { loadSubscription(session?.user?.id); }, [session, loadSubscription]);

  /* ---- Handle the redirect back from Stripe Checkout ---- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (checkout === "success" && session?.user?.id) {
      // The Stripe webhook may take a moment to land — poll briefly.
      let tries = 0;
      const interval = setInterval(async () => {
        tries += 1;
        await Promise.all([
          loadUnlocks(session.user.id),
          loadListings(),
          loadSubscription(session.user.id),
        ]);
        if (tries >= 5) clearInterval(interval);
      }, 1500);
      setTab("history");
      return () => clearInterval(interval);
    }
  }, [session, loadUnlocks, loadListings, loadSubscription]);

  /* ---- Handle the return from the email verification link ---- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify_email") !== "1") return;
    if (!session?.user?.id) return;
    (async () => {
      await supabase.rpc("mark_email_verified");
      await loadProfile(session.user.id);
      window.history.replaceState({}, "", window.location.pathname);
      setTab("add");
    })();
  }, [session, loadProfile]);

  async function handleAddListing(listing) {
    setSaving(true);
    const id = listing.id;
    const { error } = await supabase.from("listings").insert({
      id,
      owner_id: session.user.id,
      type: listing.type,
      transaction: listing.transaction,
      country: listing.country,
      city: listing.city,
      neighborhood: listing.neighborhood,
      price: Number(listing.price),
      owner_name: listing.owner,
      phone: listing.phone,
      description: listing.desc,
      photos: listing.photos || [],
    });
    setSaving(false);
    if (error) return false;
    await loadListings();
    setTab("browse");
    return true;
  }

  /* ---- Real Stripe payment: server creates the session, we redirect ---- */
  async function handleUnlock(listingId) {
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { listingId },
    });
    if (error || !data?.url) {
      throw new Error(error?.message || "Le paiement n'a pas pu démarrer, réessaie dans un instant.");
    }
    window.location.href = data.url;
  }

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (fType !== "all" && l.type !== fType) return false;
      if (fTrans !== "all" && l.transaction !== fTrans) return false;
      if (fCountry !== "all" && l.country !== fCountry) return false;
      if (q && !(`${l.neighborhood || ""} ${l.city} ${l.country} ${l.desc}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [listings, fType, fTrans, fCountry, q]);

  const unlockedList = listings.filter((l) => unlocked[l.id]);
  const isAdmin = profile?.role === "admin";
  const isVerifiedLandlord = (profile?.role === "bailleur" && profile?.verification_status === "verified") || hasActiveSubscription;

  const NAV_ITEMS = [
    ["how", "Comment ça marche"],
    ["browse", "Rechercher"],
    ["add", "Poster"],
    ["premium", "Abonnement"],
  ];

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS}</style>

      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-white" style={{ background: C.ink }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CléSchengen" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <span className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>CléSchengen</span>
        </div>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {NAV_ITEMS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="clesch-focus rounded-lg px-3 py-1.5 font-medium"
              style={{ background: tab === key ? C.gold : "transparent" }}>
              {label}
            </button>
          ))}
          <button onClick={() => setTab("history")}
            className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
            style={{ background: tab === "history" ? C.gold : "transparent" }}>
            Mes contacts
            {unlockedList.length > 0 && (
              <span className="ml-0.5 rounded-full px-1.5 text-xs" style={{ background: "rgba(255,255,255,0.2)" }}>{unlockedList.length}</span>
            )}
          </button>
          <button onClick={() => setContactOpen(true)}
            className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium">
            <MessageCircleQuestion size={14} /> Contactez-nous
          </button>
          {isAdmin && (
            <button onClick={() => setTab("admin")}
              className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
              style={{ background: tab === "admin" ? C.gold : "transparent" }}>
              <UserCog size={14} /> Admin
            </button>
          )}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {!authLoading && (session ? (
            <>
              <span className="hidden text-xs sm:inline" style={{ color: "rgba(255,255,255,0.75)" }}>{session.user.email}</span>
              <button onClick={signOut} className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium" style={{ background: "rgba(255,255,255,0.12)" }}>
                <LogOut size={14} /> Déconnexion
              </button>
            </>
          ) : (
            <button onClick={() => setAuthModal("login")} className="clesch-focus rounded-lg px-3 py-1.5 font-medium" style={{ background: "rgba(255,255,255,0.12)" }}>
              Se connecter
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {tab === "how" && <HowItWorks goTo={setTab} />}

        {tab === "browse" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Étape 1 — Trouver</p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Parcourir les annonces</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: C.slate }}>
              Filtre par type de bien, transaction et pays, puis ouvre une annonce pour débloquer le contact du propriétaire.
            </p>

            <div className="mb-5 mt-5 flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1" style={{ minWidth: "180px" }}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ville, pays, mot-clé…"
                  className="clesch-focus w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                  style={{ borderColor: C.line, background: C.card }} />
              </div>
              <Select value={fType} onChange={(e) => setFType(e.target.value)}>
                <option value="all">Tout type</option>
                {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select value={fTrans} onChange={(e) => setFTrans(e.target.value)}>
                <option value="all">Location ou vente</option>
                {Object.entries(TRANSACTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select value={fCountry} onChange={(e) => setFCountry(e.target.value)}>
                <option value="all">Tout pays</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>

            {dbLoading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: C.slate }}>
                <Loader2 size={16} className="animate-spin" /> Chargement des annonces…
              </div>
            )}

            {dbError && !dbLoading && (
              <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "#F7EAE6", color: C.rust }}>
                Impossible de synchroniser la base partagée pour le moment — réessaie dans un instant.
              </div>
            )}

            {!dbLoading && (
              <>
                <p className="mb-3 text-xs" style={{ color: C.slate }}>{filtered.length} annonce(s) trouvée(s)</p>
                {filtered.length === 0 ? (
                  <div className="rounded-xl border p-8 text-center" style={{ borderColor: C.line, color: C.slate }}>
                    Aucune annonce ne correspond à ces filtres. Essaie d'élargir ta recherche.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((l) => (
                      <ListingCard key={l.id} listing={l} unlocked={l.contactVisible} onOpen={setActive} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "add" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Espace propriétaire</p>
            {!session ? (
              <div className="mt-4 rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <Lock size={20} className="mx-auto" style={{ color: C.slate }} />
                <p className="mt-2 text-sm" style={{ color: C.slate }}>Connecte-toi ou crée un compte propriétaire pour publier une annonce.</p>
                <button onClick={() => setAuthModal("signup")} className="clesch-focus mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  Créer un compte
                </button>
              </div>
            ) : !profile ? (
              <div className="mt-4 flex items-center justify-center gap-2 py-16 text-sm" style={{ color: C.slate }}>
                <Loader2 size={16} className="animate-spin" /> Chargement de ton compte…
              </div>
            ) : !isVerifiedLandlord ? (
              <div className="mt-4">
                <VerificationGate
                  profile={profile}
                  userId={session.user.id}
                  userEmail={session.user.email}
                  onUpgradeRequested={async () => { await supabase.rpc("request_bailleur_upgrade"); await loadProfile(session.user.id); }}
                  onSubmitted={() => loadProfile(session.user.id)}
                  onEmailVerified={() => loadProfile(session.user.id)}
                />
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                  <AddListingForm onSubmit={handleAddListing} saving={saving} />
                </div>
                <button onClick={() => setTab("premium")} className="clesch-focus mt-4 flex items-center gap-1.5 text-sm font-medium" style={{ color: C.gold }}>
                  <Sparkles size={14} /> Mettre mes annonces en avant avec un abonnement Premium
                </button>
              </>
            )}
          </div>
        )}

        {tab === "premium" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Espace propriétaire</p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Abonnement Premium</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: C.slate }}>
              Pendant toute la durée de validité de ton abonnement : accès libre pour publier des annonces sans
              attendre la vérification d'identité, et déblocage gratuit et illimité des contacts de toutes les
              annonces.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: C.green }}>
              <ShieldCheck size={13} /> Paiement réel et sécurisé via Stripe.
            </p>
            {hasActiveSubscription && (
              <p className="mt-3 flex items-center gap-1.5 rounded-lg p-3 text-sm" style={{ background: "#EAF3EE", color: C.green }}>
                <CheckCircle2 size={15} /> Ton abonnement est actif — profite de l'accès libre dès maintenant.
              </p>
            )}

            {!session ? (
              <div className="mt-4 rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <Lock size={20} className="mx-auto" style={{ color: C.slate }} />
                <p className="mt-2 text-sm" style={{ color: C.slate }}>Connecte-toi pour lier l'abonnement à ton compte.</p>
                <button onClick={() => setAuthModal("login")} className="clesch-focus mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  Se connecter
                </button>
              </div>
            ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.key} className="flex flex-col rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2" style={{ color: C.gold }}>
                    <Sparkles size={16} />
                    <span className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{p.label}</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm" style={{ color: C.slate }}>{p.tagline}</p>
                  <ul className="mt-3 space-y-1 text-xs" style={{ color: C.slate }}>
                    <li>• Publication libre, sans attendre la vérification d'identité</li>
                    <li>• Contacts débloqués gratuitement et sans limite</li>
                    <li>• Badge Premium sur tes annonces</li>
                  </ul>
                  <a href={`${p.url}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="clesch-focus mt-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
                    style={{ background: C.ink }}>
                    S'abonner <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>Mes contacts débloqués</h2>
            {!session ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border p-10 text-center" style={{ borderColor: C.line, color: C.slate }}>
                <Lock size={20} />
                Connecte-toi pour voir les contacts que tu as débloqués.
                <button onClick={() => setAuthModal("login")} className="clesch-focus mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  Se connecter
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm" style={{ color: C.slate }}>
                  Ces contacts restent enregistrés sur ton compte, même si tu reviens plus tard.
                </p>
                {unlockedList.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border p-10 text-center" style={{ borderColor: C.line, color: C.slate }}>
                    <ListChecks size={22} />
                    Tu n'as encore débloqué aucun contact. Va dans « Rechercher » pour trouver une annonce.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {unlockedList.map((l) => (
                      <div key={l.id} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                        <p style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.slate, fontSize: "11px" }}>{l.id}</p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: C.ink }}>{l.owner} — {l.city}</p>
                        <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-1.5" style={{ background: C.paper }}>
                          <span className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{l.phone}</span>
                          <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="clesch-focus" style={{ color: C.green }}><Phone size={15} /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "admin" && isAdmin && <AdminPanel />}
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 pt-4 text-xs" style={{ color: C.slate }}>
        CléSchengen — les annonces sont stockées dans une base partagée. Les coordonnées des propriétaires ne sont
        révélées qu'après paiement, et la publication d'annonces est réservée aux comptes propriétaires vérifiés.
      </footer>

      {active && (
        <ListingModal
          listing={active}
          unlocked={active.contactVisible}
          session={session}
          onClose={() => setActive(null)}
          onUnlock={handleUnlock}
          onRequireAuth={() => setAuthModal("login")}
        />
      )}

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}

      {contactOpen && <ContactModal defaultEmail={session?.user?.email} onClose={() => setContactOpen(false)} />}
    </div>
  );
}
