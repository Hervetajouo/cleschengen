import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Home, BedDouble, Car, MapPin, Lock, Search, Plus, Phone, X,
  CheckCircle2, HelpCircle, Copy, ArrowRight,
  ShieldCheck, ChevronDown, KeyRound, ListChecks, Loader2, Info, Building2,
  ImagePlus, Trash2, BadgeCheck, Smartphone, Sparkles, ImageOff, ExternalLink,
  LogOut, UploadCloud, UserCog, ShieldQuestion, Mail, KeySquare, Package, MessageCircleQuestion,
  Heart, MessageCircle, Share2,
} from "lucide-react";
import { supabase } from "./supabaseClient.js";
import { LANGS, t } from "./i18n.js";
import { COUNTRY_GUIDES, GENERIC_GUIDE } from "./guides.js";
import { COUNTRY_COORDS } from "./mapData.js";
import { TERMS_CONTENT, PRIVACY_CONTENT } from "./legal.js";

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

function priceUnit(lang, transaction, type) {
  if (transaction === "vente") return "";
  return type === "voiture" || type === "appareils" ? t(lang, "unit_day") : t(lang, "unit_month");
}

function detailsSummary(lang, listing) {
  const d = listing.details || {};
  const hasDetails = Object.keys(d).length > 0;
  if (!hasDetails) return "";
  if (listing.type === "maison") {
    if (d.subtype === "appartement") {
      const aptLabel = t(lang, `apt_${d.aptSubtype || "bilocale"}`).split(" (")[0];
      return `${aptLabel} · ${d.bedrooms || "1"} ${t(lang, "add_bedrooms").toLowerCase()} · ${d.bathrooms || "1"} ${t(lang, "add_bathrooms").toLowerCase()}`;
    }
    const parts = [t(lang, "subtype_villa"), `${d.bedrooms || "1"} ${t(lang, "add_bedrooms").toLowerCase()}`];
    if (d.hasLivingRoom) parts.push(t(lang, "add_living_room").toLowerCase());
    parts.push(`${d.bathrooms || "1"} ${t(lang, "add_bathrooms").toLowerCase()}`);
    return parts.join(" · ");
  }
  if (listing.type === "chambre") {
    return d.showerType === "shared" ? t(lang, "shower_shared") + " " + t(lang, "add_shower_type").toLowerCase() : t(lang, "shower_private") + " " + t(lang, "add_shower_type").toLowerCase();
  }
  if (listing.type === "appareils") {
    return t(lang, `appliance_${d.applianceCategory || "autre"}`);
  }
  return "";
}

/* Generates a ready-to-edit listing description from the structured fields
   already filled in the form — no AI/API needed, free and instant. */
function generateDescription(lang, form) {
  const city = form.city || (lang === "en" ? "this city" : "cette ville");
  const country = form.country || "";
  const isRent = form.transaction === "location";

  if (form.type === "maison") {
    const isApt = form.subtype === "appartement";
    const bedrooms = form.bedrooms || "1";
    const bathrooms = form.bathrooms || "1";
    if (lang === "en") {
      const kind = isApt ? `a ${t("en", `apt_${form.aptSubtype || "bilocale"}`).split(" (")[0].toLowerCase()} apartment` : "a house";
      let s = `${isRent ? "For rent" : "For sale"}: ${kind} in ${city}, ${country}, with ${bedrooms} bedroom${bedrooms > 1 ? "s" : ""}`;
      if (!isApt && form.hasLivingRoom) s += " and a living room";
      s += ` and ${bathrooms} bathroom${bathrooms > 1 ? "s" : ""}.`;
      if (isRent && form.availableFrom) s += ` Available from ${new Date(form.availableFrom).toLocaleDateString("en-GB")}.`;
      s += " Bright and well maintained, close to shops and public transport. Contact the owner to arrange a viewing.";
      return s;
    }
    const kind = isApt ? `un appartement ${t("fr", `apt_${form.aptSubtype || "bilocale"}`).split(" (")[0].toLowerCase()}` : "une maison";
    let s = `${isRent ? "À louer" : "À vendre"} : ${kind} à ${city}, ${country}, avec ${bedrooms} chambre${bedrooms > 1 ? "s" : ""}`;
    if (!isApt && form.hasLivingRoom) s += ", un salon";
    s += ` et ${bathrooms} salle${bathrooms > 1 ? "s" : ""} de bain.`;
    if (isRent && form.availableFrom) s += ` Disponible à partir du ${new Date(form.availableFrom).toLocaleDateString("fr-FR")}.`;
    s += " Lumineux et bien entretenu, proche des commerces et des transports. Contacte le propriétaire pour organiser une visite.";
    return s;
  }

  if (form.type === "chambre") {
    const shower = form.showerType === "shared"
      ? (lang === "en" ? "shared bathroom" : "salle de bain partagée")
      : (lang === "en" ? "private bathroom" : "salle de bain privée");
    return lang === "en"
      ? `Furnished room available in ${city}, ${country}, with ${shower}. Quiet, welcoming home, close to public transport. Ideal for a student or young professional. Contact the owner for more details.`
      : `Chambre meublée disponible à ${city}, ${country}, avec ${shower}. Logement calme et accueillant, proche des transports. Idéal pour un·e étudiant·e ou jeune actif·ve. Contacte le propriétaire pour plus de détails.`;
  }

  if (form.type === "voiture") {
    return lang === "en"
      ? `${isRent ? "Car for rent" : "Car for sale"} in ${city}, ${country}. Well maintained, regularly serviced. Contact the owner for the full details and availability.`
      : `Voiture ${isRent ? "à louer" : "à vendre"} à ${city}, ${country}. Bien entretenue, révisions à jour. Contacte le propriétaire pour tous les détails et les disponibilités.`;
  }

  if (form.type === "appareils") {
    const cat = t(lang, `appliance_${form.applianceCategory || "autre"}`).toLowerCase();
    return lang === "en"
      ? `${cat.charAt(0).toUpperCase() + cat.slice(1)} item ${isRent ? "for rent" : "for sale"} in ${city}, ${country}. Good working condition. Contact the owner for more information.`
      : `Appareil (${cat}) ${isRent ? "à louer" : "à vendre"} à ${city}, ${country}. Bon état de fonctionnement. Contacte le propriétaire pour plus d'informations.`;
  }

  return "";
}

const UNLOCK_FEE = 4.99;


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

function genCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caractères ambigus (0/O, 1/I…)
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
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

function waLink(phone) {
  const digits = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
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
function ListingCard({ listing, unlocked, onOpen, lang, favorited, onToggleFavorite }) {
  const TypeIcon = TYPES[listing.type].icon;
  const unit = priceUnit(lang, listing.transaction, listing.type);
  const cover = listing.photos && listing.photos[0];
  return (
    <div className="relative flex overflow-hidden rounded-xl shadow-sm transition hover:shadow-md" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
        className="clesch-focus absolute right-2 top-2 z-10 rounded-full p-1.5"
        style={{ background: "rgba(255,255,255,0.9)" }}
        aria-pressed={favorited}
      >
        <Heart size={16} style={{ color: favorited ? C.rust : C.slate }} fill={favorited ? C.rust : "none"} />
      </button>
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
                <span className="text-sm font-semibold">{t(lang, `type_${listing.type}`)}</span>
                {listing.verified && <BadgeCheck size={14} style={{ color: C.green }} />}
              </div>
            </div>
            <Badge tone={listing.transaction === "vente" ? "green" : "ink"}>
              {t(lang, `trans_${listing.transaction}`)}
            </Badge>
            <div className="mt-1.5 flex items-center gap-1 text-sm" style={{ color: C.slate }}>
              <MapPin size={13} />
              <span>{listing.city}, {listing.country}</span>
            </div>
            {detailsSummary(lang, listing) && (
              <p className="mt-1 text-xs" style={{ color: C.slate }}>{detailsSummary(lang, listing)}</p>
            )}
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
          {t(lang, "modal_ref")} {listing.id}
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
          {unlocked ? t(lang, "card_unlocked") : t(lang, "card_view")}
        </span>
      </button>
    </div>
  );
}

/* ---------- Detail + payment modal ---------- */
function ListingModal({ listing, unlocked, session, onClose, onUnlock, onRequireAuth, lang, allListings, favorited, onToggleFavorite }) {
  const [stage, setStage] = useState(unlocked ? "revealed" : "detail");
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!session) { setMessages([]); return; }
    const { data } = await supabase
      .from("listing_messages")
      .select("*")
      .eq("listing_id", listing.id)
      .eq("seeker_id", session.user.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }, [session, listing.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function sendMessage() {
    if (!session) { onClose(); onRequireAuth(); return; }
    if (!messageText.trim()) return;
    setSendingMsg(true);
    const { error: err } = await supabase.from("listing_messages").insert({
      listing_id: listing.id, seeker_id: session.user.id, from_owner: false, message: messageText.trim(),
    });
    if (!err) {
      supabase.functions.invoke("notify-listing-message", {
        body: { listingId: listing.id, seekerId: session.user.id, fromOwner: false },
      }).then(null, () => {});
      setMessageText("");
      loadMessages();
    }
    setSendingMsg(false);
  }

  useEffect(() => {
    supabase.rpc("increment_listing_view", { p_listing_id: listing.id }).then(null, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id]);

  const TypeIcon = TYPES[listing.type].icon;
  const unit = priceUnit(lang, listing.transaction, listing.type);

  const similar = (allListings || []).filter((l) =>
    l.id !== listing.id && l.type === listing.type && l.transaction === listing.transaction && l.country === listing.country
  );
  let priceHint = null;
  if (similar.length >= 2) {
    const avg = similar.reduce((s, l) => s + Number(l.price), 0) / similar.length;
    if (listing.price <= avg * 0.9) priceHint = { key: "price_below", color: C.green };
    else if (listing.price >= avg * 1.1) priceHint = { key: "price_above", color: C.rust };
    else priceHint = { key: "price_average", color: C.slate };
  }

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
      setError(err.message || t(lang, "modal_payment_error"));
      setStage("detail");
    }
  }

  function copyPhone() {
    navigator.clipboard?.writeText(listing.phone).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function shareListing() {
    const url = `${window.location.origin}/annonce/${listing.id}`;
    if (navigator.share) {
      navigator.share({ title: "CléSchengen", url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-md overflow-y-auto rounded-2xl shadow-xl" style={{ background: C.card, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4" style={{ background: C.ink }}>
          <div className="flex items-center gap-2 text-white">
            <TypeIcon size={18} />
            <span className="text-sm font-semibold">{t(lang, `type_${listing.type}`)} · {t(lang, `trans_${listing.transaction}`)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={shareListing} className="clesch-focus" style={{ color: "rgba(255,255,255,0.8)" }}>
              <Share2 size={18} />
            </button>
            <button onClick={() => onToggleFavorite(listing.id)} className="clesch-focus" aria-pressed={favorited}>
              <Heart size={18} style={{ color: favorited ? "#E58B7B" : "rgba(255,255,255,0.8)" }} fill={favorited ? "#E58B7B" : "none"} />
            </button>
            <button onClick={onClose} className="clesch-focus hover:text-white" style={{ color: "rgba(255,255,255,0.8)" }}><X size={18} /></button>
          </div>
        </div>
        {shareCopied && (
          <p className="px-4 pt-2 text-xs" style={{ color: C.green, background: C.ink }}>{t(lang, "modal_link_copied")}</p>
        )}

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
              <ImageOff size={16} /> {t(lang, "modal_no_photo")}
            </div>
          )}

          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
              {listing.city}, {listing.country}
            </h3>
            {listing.verified && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#EAF3EE", color: C.green }}>
                <BadgeCheck size={12} /> {t(lang, "modal_verified_badge")}
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.slate }}>
            {t(lang, "modal_ref")} {listing.id}
          </p>
          {detailsSummary(lang, listing) && (
            <p className="mt-1.5 text-sm font-medium" style={{ color: C.ink }}>{detailsSummary(lang, listing)}</p>
          )}
          {listing.availableFrom && (
            <p className="mt-1 text-xs" style={{ color: C.slate }}>{t(lang, "add_available_from")} {new Date(listing.availableFrom).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}</p>
          )}

          <p className="mt-3 text-sm leading-relaxed" style={{ color: C.ink }}>{listing.desc}</p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>
              {formatPrice(listing.price)} €
            </span>
            {unit && <span className="text-sm" style={{ color: C.slate }}>{unit}</span>}
          </div>
          {priceHint && (
            <p className="mt-1 text-xs font-medium" style={{ color: priceHint.color }}>{t(lang, priceHint.key)}</p>
          )}

          <div className="my-5 border-t" style={{ borderColor: C.line }} />

          {stage === "detail" && (
            <div className="rounded-xl p-4 text-center" style={{ background: C.paper, border: `1px dashed ${C.line}` }}>
              <Lock size={20} className="mx-auto" style={{ color: C.slate }} />
              <p className="mt-2 text-sm" style={{ color: C.slate }}>
                {t(lang, "modal_locked_message")}
              </p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs" style={{ color: C.green }}>
                <ShieldCheck size={13} /> {t(lang, "modal_secure_payment")}
              </p>
              {error && <p className="mt-2 text-xs" style={{ color: C.rust }}>{error}</p>}
              <button
                onClick={startCheckout}
                className="clesch-focus mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: C.gold }}
              >
                <KeyRound size={16} /> {t(lang, "modal_unlock_button")} — {UNLOCK_FEE.toFixed(2)} €
              </button>
              {!session && (
                <p className="mt-2 text-xs" style={{ color: C.slate }}>{t(lang, "modal_account_required")}</p>
              )}
            </div>
          )}

          {stage === "detail" && (
            <div className="mt-4 rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.ink }}>
                <MessageCircle size={15} /> {t(lang, "msg_title")}
              </p>
              <p className="mt-1 text-xs" style={{ color: C.slate }}>{t(lang, "msg_subtitle")}</p>

              {messages.length > 0 && (
                <div className="mt-3 space-y-2">
                  {messages.map((m) => (
                    <div key={m.id} className="rounded-lg p-2.5 text-sm" style={{ background: m.from_owner ? "#EAF3EE" : C.paper, marginLeft: m.from_owner ? 0 : "10%", marginRight: m.from_owner ? "10%" : 0 }}>
                      <p className="text-xs font-medium" style={{ color: m.from_owner ? C.green : C.slate }}>
                        {m.from_owner ? t(lang, "msg_from_owner") : t(lang, "msg_from_you")}
                      </p>
                      <p style={{ color: C.ink }}>{m.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  value={messageText} onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t(lang, "msg_placeholder")}
                  className="clesch-focus flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: C.line }}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                />
                <button disabled={sendingMsg} onClick={sendMessage}
                  className="clesch-focus rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: C.ink }}>
                  {sendingMsg ? <Loader2 size={15} className="animate-spin" /> : t(lang, "msg_send")}
                </button>
              </div>
            </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-2 py-6">
              <Loader2 size={22} className="animate-spin" style={{ color: C.gold }} />
              <p className="text-sm" style={{ color: C.slate }}>{t(lang, "modal_processing")}</p>
            </div>
          )}

          {stage === "revealed" && (
            <div className="stamp-reveal rounded-xl p-4" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2" style={{ color: C.green }}>
                <CheckCircle2 size={16} />
                <span className="text-sm font-semibold">{t(lang, "modal_revealed_title")}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: C.ink }}>
                <Building2 size={15} />
                <span className="font-semibold">{listing.owner}</span>
              </div>
              {listing.address && (
                <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: C.ink }}>
                  <MapPin size={15} />
                  <span>{listing.address}, {listing.city}</span>
                </div>
              )}
              <div className="mt-1 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <span className="text-sm" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.ink }}>{listing.phone}</span>
                <button onClick={copyPhone} className="clesch-focus" style={{ color: C.slate }}><Copy size={15} /></button>
              </div>
              {copied && <p className="mt-1 text-xs" style={{ color: C.green }}>{t(lang, "modal_copied")}</p>}
              <a href={`tel:${listing.phone.replace(/\s/g, "")}`} className="clesch-focus mt-3 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: C.green }}>
                <Phone size={15} /> {t(lang, "modal_call")} {listing.owner.split(" ")[0]}
              </a>
              <a href={waLink(listing.phone)} target="_blank" rel="noopener noreferrer" className="clesch-focus mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: "#25D366" }}>
                <MessageCircle size={15} /> {t(lang, "whatsapp_button")}
              </a>
              <p className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: C.slate }}>
                <Info size={12} /> {t(lang, "modal_history_hint")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Add listing form ---------- */
function AddListingForm({ onSubmit, saving, lang }) {
  const empty = {
    owner: "", phone: "", type: "maison", transaction: "location", country: COUNTRIES[0], city: "",
    address: "", price: "", desc: "", availableFrom: "",
    subtype: "villa", bedrooms: "1", bathrooms: "1", hasLivingRoom: true,
    aptSubtype: "bilocale", showerType: "private", applianceCategory: "electronique",
  };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [saveError, setSaveError] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
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
  const [captchaCode, setCaptchaCode] = useState(genCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

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
      setOtpError(t(lang, "add_otp_need_phone"));
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
      setOtpError(t(lang, "add_otp_wrong"));
    }
  }

  function refreshCaptcha() {
    setCaptchaCode(genCaptcha());
    setCaptchaInput("");
  }

  function validate() {
    const e = {};
    if (!form.owner.trim()) e.owner = t(lang, "add_err_owner");
    if (!form.phone.trim()) e.phone = t(lang, "add_err_phone");
    if (!form.city.trim()) e.city = t(lang, "add_err_city");
    if (!form.address.trim()) e.address = t(lang, "add_err_address");
    if (!form.price || Number(form.price) <= 0) e.price = t(lang, "add_err_price");
    if (!form.desc.trim()) e.desc = t(lang, "add_err_desc");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setGateError("");
    if (!validate()) return;
    if (!verified) {
      setGateError(t(lang, "add_gate_phone_error"));
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setGateError(t(lang, "add_gate_captcha_error"));
      refreshCaptcha();
      return;
    }
    const id = "SCH-" + Date.now().toString(36).toUpperCase().slice(-5);

    let details = {};
    if (form.type === "maison") {
      details = form.subtype === "appartement"
        ? { subtype: "appartement", aptSubtype: form.aptSubtype, bedrooms: form.bedrooms, bathrooms: form.bathrooms }
        : { subtype: "villa", bedrooms: form.bedrooms, hasLivingRoom: form.hasLivingRoom, bathrooms: form.bathrooms };
    } else if (form.type === "chambre") {
      details = { showerType: form.showerType };
    } else if (form.type === "appareils") {
      details = { applianceCategory: form.applianceCategory };
    }

    setGeocoding(true);
    let lat = null, lng = null;
    try {
      const { data: geo } = await supabase.functions.invoke("geocode-address", {
        body: { address: form.address, city: form.city, country: form.country },
      });
      lat = geo?.lat ?? null;
      lng = geo?.lng ?? null;
    } catch { /* geocoding failure isn't blocking — the listing still gets published */ }
    setGeocoding(false);

    const listing = {
      id, ...form, price: Number(form.price), verified: true, photos, details,
      lat, lng, availableFrom: form.type === "maison" && form.transaction === "location" ? form.availableFrom : null,
    };
    setSaveError(false);
    const ok = await onSubmit(listing);
    if (ok) {
      setSuccess(id);
      setForm(empty);
      setPhotos([]);
      setVerified(false);
      setOtpSent(false);
      refreshCaptcha();
    } else {
      setSaveError(true);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "add_form_title")}</h2>
      <p className="mt-1 text-sm" style={{ color: C.slate }}>
        {t(lang, "add_form_subtitle")}
      </p>

      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: "#EAF3EE", color: C.green }}>
          <CheckCircle2 size={16} /> {t(lang, "add_success_prefix")} <strong>&nbsp;{success}</strong>. {t(lang, "add_success_suffix")}
        </div>
      )}
      {saveError && (
        <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: "#F7EAE6", color: C.rust }}>
          {t(lang, "add_save_error")}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_owner_name")}</label>
          <input value={form.owner} onChange={(e) => set("owner", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.owner ? C.rust : C.line }} placeholder={t(lang, "add_owner_name_ph")} />
          {errors.owner && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.owner}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_phone")}</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.phone ? C.rust : C.line }} placeholder="+33 6 12 34 56 78" />
          {errors.phone && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.phone}</p>}
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_type")}</label>
          <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
            {Object.keys(TYPES).map((k) => <option key={k} value={k}>{t(lang, `type_${k}`)}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>Type d'annonce</label>
          <Select value={form.transaction} onChange={(e) => set("transaction", e.target.value)}>
            {Object.keys(TRANSACTIONS).map((k) => <option key={k} value={k}>{t(lang, `trans_${k}`)}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_country")}</label>
          <Select value={form.country} onChange={(e) => set("country", e.target.value)}>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_city")}</label>
          <input value={form.city} onChange={(e) => set("city", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.city ? C.rust : C.line }} placeholder={t(lang, "add_city_ph")} />
          {errors.city && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.city}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_address")}</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.address ? C.rust : C.line }} placeholder={t(lang, "add_address_ph")} />
          {errors.address && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.address}</p>}
          <p className="mt-1 text-xs" style={{ color: C.slate }}>{t(lang, "add_address_note")}</p>
        </div>

        {/* Type-specific characteristics */}
        {form.type === "maison" && (
          <div className="col-span-2 rounded-lg p-3.5" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_house_subtype")}</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => set("subtype", "villa")}
                className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: form.subtype === "villa" ? C.gold : C.line, background: form.subtype === "villa" ? "#FBF3E7" : C.card, color: C.ink }}>
                {t(lang, "subtype_villa")}
              </button>
              <button type="button" onClick={() => set("subtype", "appartement")}
                className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: form.subtype === "appartement" ? C.gold : C.line, background: form.subtype === "appartement" ? "#FBF3E7" : C.card, color: C.ink }}>
                {t(lang, "subtype_appartement")}
              </button>
            </div>

            {form.subtype === "appartement" && (
              <div className="mt-2.5">
                <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_apt_subtype")}</label>
                <Select value={form.aptSubtype} onChange={(e) => set("aptSubtype", e.target.value)}>
                  <option value="monolocale">{t(lang, "apt_monolocale")}</option>
                  <option value="bilocale">{t(lang, "apt_bilocale")}</option>
                  <option value="trilocale">{t(lang, "apt_trilocale")}</option>
                  <option value="quadrilocale">{t(lang, "apt_quadrilocale")}</option>
                </Select>
              </div>
            )}

            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_bedrooms")}</label>
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
                  className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line, background: C.card }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_bathrooms")}</label>
                <input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
                  className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line, background: C.card }} />
              </div>
            </div>

            {form.subtype === "villa" && (
              <label className="clesch-focus mt-2.5 flex items-center gap-2 text-sm" style={{ color: C.ink }}>
                <input type="checkbox" checked={form.hasLivingRoom} onChange={(e) => set("hasLivingRoom", e.target.checked)} />
                {t(lang, "add_living_room")}
              </label>
            )}

            {form.transaction === "location" && (
              <div className="mt-2.5">
                <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_available_from")}</label>
                <input type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)}
                  className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line, background: C.card }} />
              </div>
            )}
          </div>
        )}

        {form.type === "chambre" && (
          <div className="col-span-2 rounded-lg p-3.5" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_shower_type")}</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => set("showerType", "private")}
                className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: form.showerType === "private" ? C.gold : C.line, background: form.showerType === "private" ? "#FBF3E7" : C.card, color: C.ink }}>
                {t(lang, "shower_private")}
              </button>
              <button type="button" onClick={() => set("showerType", "shared")}
                className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: form.showerType === "shared" ? C.gold : C.line, background: form.showerType === "shared" ? "#FBF3E7" : C.card, color: C.ink }}>
                {t(lang, "shower_shared")}
              </button>
            </div>
          </div>
        )}

        {form.type === "appareils" && (
          <div className="col-span-2 rounded-lg p-3.5" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_appliance_category")}</label>
            <Select value={form.applianceCategory} onChange={(e) => set("applianceCategory", e.target.value)}>
              <option value="electronique">{t(lang, "appliance_electronique")}</option>
              <option value="electromenager">{t(lang, "appliance_electromenager")}</option>
              <option value="autre">{t(lang, "appliance_autre")}</option>
            </Select>
          </div>
        )}

        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>
            {t(lang, "add_price")} (€ {priceUnit(lang, form.transaction, form.type) || t(lang, "add_price_total")})
          </label>
          <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.price ? C.rust : C.line }} placeholder={t(lang, "add_price_ph")} />
          {errors.price && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.price}</p>}
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_description")}</label>
            <button type="button" onClick={() => set("desc", generateDescription(lang, form))}
              className="clesch-focus flex items-center gap-1 text-xs font-medium" style={{ color: C.gold }}>
              <Sparkles size={12} /> {t(lang, "add_generate_desc")}
            </button>
          </div>
          <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={3}
            className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: errors.desc ? C.rust : C.line }} placeholder={t(lang, "add_description_ph")} />
          {errors.desc && <p className="mt-1 text-xs" style={{ color: C.rust }}>{errors.desc}</p>}
          <p className="mt-1 text-xs" style={{ color: C.slate }}>{t(lang, "add_generate_desc_note")}</p>
        </div>

        {/* Photos */}
        <div className="col-span-2">
          <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_photos")} ({MAX_PHOTOS} max)</label>
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
            {t(lang, "add_photos_note")}
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
              <BadgeCheck size={15} /> {t(lang, "add_phone_verified")}
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs" style={{ color: C.slate }}>
                {t(lang, "add_phone_confirm_note")}
              </p>
              {!otpSent ? (
                <button onClick={sendOtp} className="clesch-focus mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: C.ink }}>
                  {t(lang, "add_phone_send_code")}
                </button>
              ) : (
                <div className="mt-2">
                  <p className="rounded-md p-2 text-xs" style={{ background: "#FFF7E8", color: "#8a6a2f" }}>
                    {t(lang, "add_phone_demo_note", { code: otpCode })}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder={t(lang, "add_phone_code_ph")}
                      className="clesch-focus w-28 rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ borderColor: C.line }} />
                    <button onClick={confirmOtp} className="clesch-focus rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: C.gold }}>
                      {t(lang, "add_phone_confirm")}
                    </button>
                    <button onClick={sendOtp} className="clesch-focus text-xs" style={{ color: C.slate }}>{t(lang, "add_phone_resend")}</button>
                  </div>
                  {otpError && <p className="mt-1 text-xs" style={{ color: C.rust }}>{otpError}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Anti-robot check */}
        <div className="col-span-2 rounded-lg p-3.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <p className="text-sm font-medium" style={{ color: C.ink }}>{t(lang, "add_captcha_label")}</p>
          <p className="mt-1 text-xs" style={{ color: C.slate }}>{t(lang, "add_captcha_note")}</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="select-none rounded-lg px-4 py-2 text-lg font-bold tracking-[0.3em]"
              style={{ background: C.paper, border: `1px dashed ${C.line}`, color: C.ink, textDecoration: "line-through", fontStyle: "italic" }}
            >
              {captchaCode}
            </span>
            <button type="button" onClick={refreshCaptcha} className="clesch-focus rounded-lg p-2 text-lg" style={{ color: C.slate }} title="Générer un autre code">
              ↻
            </button>
          </div>
          <input
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            placeholder={t(lang, "add_captcha_ph")}
            className="clesch-focus mt-2 w-full max-w-xs rounded-lg border px-3 py-2 text-sm uppercase outline-none"
            style={{ borderColor: C.line }}
          />
        </div>
      </div>

      {gateError && <p className="mt-3 text-sm" style={{ color: C.rust }}>{gateError}</p>}

      <button onClick={handleSubmit} disabled={saving || geocoding}
        className="clesch-focus mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
        style={{ background: C.ink, opacity: (saving || geocoding) ? 0.6 : 1 }}>
        {(saving || geocoding) ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {saving ? t(lang, "add_submitting") : geocoding ? t(lang, "add_locating") : t(lang, "add_submit")}
      </button>
    </div>
  );
}

/* ---------- Dedicated onboarding tab ---------- */
/* ---------- Country guides ---------- */
function CountryGuides({ lang }) {
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const guide = COUNTRY_GUIDES[selected]?.[lang] || COUNTRY_GUIDES[selected]?.fr;
  const isGeneric = !COUNTRY_GUIDES[selected];
  const shown = guide || GENERIC_GUIDE[lang] || GENERIC_GUIDE.fr;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>CléSchengen</p>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "guides_title")}</h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: C.slate }}>{t(lang, "guides_subtitle")}</p>

      <div className="mt-5 max-w-xs">
        <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "guides_select_country")}</label>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {isGeneric && (
        <p className="mt-3 text-xs italic" style={{ color: C.slate }}>{t(lang, "guides_generic_notice")}</p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>{t(lang, "guides_documents")}</p>
          <p className="mt-1.5 text-sm" style={{ color: C.ink }}>{shown.documents}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>{t(lang, "guides_deposit")}</p>
          <p className="mt-1.5 text-sm" style={{ color: C.ink }}>{shown.deposit}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>{t(lang, "guides_notice")}</p>
          <p className="mt-1.5 text-sm" style={{ color: C.ink }}>{shown.notice}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#FBF3E7", border: `1px solid ${C.line}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>{t(lang, "guides_tip")}</p>
          <p className="mt-1.5 text-sm" style={{ color: C.ink }}>{shown.tip}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Interactive map (Leaflet, loaded via CDN — see index.html) ---------- */
function hashJitter(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  // Deterministic pseudo-random offset in [-0.35, 0.35] degrees, different for lat/lng.
  const a = ((h % 700) / 1000) - 0.35;
  const b = (((h * 7) % 700) / 1000) - 0.35;
  return [a, b];
}

function ListingsMap({ listings, lang, onOpen }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    function init() {
      if (cancelled || !window.L || !containerRef.current || mapRef.current) return;
      mapRef.current = window.L.map(containerRef.current).setView([50, 10], 4);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(mapRef.current);
    }
    if (window.L) init();
    else {
      const interval = setInterval(() => { if (window.L) { init(); clearInterval(interval); } }, 200);
      return () => { cancelled = true; clearInterval(interval); };
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];
    listings.forEach((l) => {
      let position;
      if (l.lat != null && l.lng != null) {
        position = [l.lat, l.lng];
      } else {
        const base = COUNTRY_COORDS[l.country];
        if (!base) return;
        const [dLat, dLng] = hashJitter(l.id);
        position = [base[0] + dLat, base[1] + dLng];
      }
      const marker = window.L.marker(position).addTo(mapRef.current);
      const label = `${t(lang, `type_${l.type}`)} · ${t(lang, `trans_${l.transaction}`)} — ${l.city}, ${l.country}<br/><strong>${formatPrice(l.price)} €</strong>`;
      marker.bindPopup(label);
      marker.on("click", () => marker.openPopup());
      marker.on("popupopen", () => {
        const popupEl = marker.getPopup().getElement();
        if (popupEl && !popupEl.querySelector(".clesch-map-open")) {
          const b = document.createElement("button");
          b.className = "clesch-map-open";
          b.textContent = t(lang, "card_view");
          b.style.cssText = `margin-top:6px;background:${C.gold};color:white;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;`;
          b.onclick = () => onOpen(l);
          popupEl.querySelector(".leaflet-popup-content").appendChild(b);
        }
      });
      markersRef.current.push(marker);
    });
  }, [listings, lang, onOpen]);

  return <div ref={containerRef} style={{ height: "500px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.line}` }} />;
}

/* ---------- Legal pages (Terms / Privacy) ---------- */
function LegalPage({ content, lang }) {
  const c = content[lang] || content.fr;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{c.title}</h1>
      <p className="mt-1 text-xs" style={{ color: C.slate }}>{c.updated}</p>
      <div className="mt-6 space-y-5">
        {c.sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-base font-semibold" style={{ color: C.ink }}>{s.h}</h2>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: C.slate }}>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Cookie consent banner ---------- */
function CookieBanner({ lang, onOpenPrivacy }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("clesch-cookie-consent")) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("clesch-cookie-consent", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-xl p-4 shadow-lg sm:flex-row" style={{ background: C.ink }}>
        <p className="flex-1 text-xs" style={{ color: "rgba(255,255,255,0.85)" }}>
          {t(lang, "cookie_banner_text")}{" "}
          <button onClick={onOpenPrivacy} className="clesch-focus underline" style={{ color: C.gold }}>
            {t(lang, "cookie_banner_link")}
          </button>
        </p>
        <button onClick={accept} className="clesch-focus flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
          {t(lang, "cookie_banner_accept")}
        </button>
      </div>
    </div>
  );
}

const HERO_IMAGES = ["/hero-bg-2.png", "/hero-bg-3.png", "/hero-bg-4.png", "/hero-bg-5.png", "/hero-bg-6.png", "/hero-bg.png"];

function HowItWorks({ goTo, lang }) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { n: "01", title: t(lang, "how_step1_title"), body: t(lang, "how_step1_body") },
    { n: "02", title: t(lang, "how_step2_title"), body: t(lang, "how_step2_body") },
    { n: "03", title: t(lang, "how_step3_title"), body: t(lang, "how_step3_body", { fee: UNLOCK_FEE.toFixed(2) }) },
  ];
  return (
    <div>
      {/* Full-bleed hero banner, breaks out of the centered <main> container */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] -mt-8 w-screen">
        <div className="relative isolate overflow-hidden" style={{ minHeight: "460px" }}>
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
              style={{ opacity: i === heroIndex ? 1 : 0, transitionDuration: "1500ms" }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(22,35,63,0.80) 0%, rgba(22,35,63,0.55) 45%, rgba(22,35,63,0.92) 100%)" }}
          />
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center sm:py-28">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.gold }}>CléSchengen</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-white sm:text-5xl" style={{ fontFamily: "'Fraunces', serif" }}>
              {t(lang, "how_title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base" style={{ color: "rgba(255,255,255,0.85)" }}>
              {t(lang, "how_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => goTo("browse")} className="clesch-focus flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: C.gold }}>
                {t(lang, "how_cta_browse")} <ArrowRight size={15} />
              </button>
              <button onClick={() => goTo("add")} className="clesch-focus flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.4)" }}>
                {t(lang, "how_cta_post")} <Plus size={15} />
              </button>
            </div>
            <div className="mt-8 flex items-center gap-2">
              {HERO_IMAGES.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="clesch-focus rounded-full transition-all"
                  style={{
                    width: i === heroIndex ? "20px" : "8px",
                    height: "8px",
                    background: i === heroIndex ? C.gold : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-2xl font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.gold }}>{s.n}</div>
            <div className="mt-2 text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{s.title}</div>
            <div className="mt-1.5 text-sm" style={{ color: C.slate }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Auth (login / signup) ---------- */
function AuthModal({ mode: initialMode, onClose, lang }) {
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
        setNotice(t(lang, "auth_signup_notice"));
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
            {mode === "login" ? t(lang, "auth_login_title") : t(lang, "auth_signup_title")}
          </h3>
          <button onClick={onClose} className="clesch-focus" style={{ color: C.slate }}><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-2.5">
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "auth_email")}</label>
            <div className="relative mt-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="clesch-focus w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none" style={{ borderColor: C.line }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "auth_password")}</label>
            <div className="relative mt-1">
              <KeySquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="clesch-focus w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none" style={{ borderColor: C.line }} />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium" style={{ color: C.slate }}>{lang === "en" ? "I am…" : "Je suis…"}</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRole("chercheur")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: role === "chercheur" ? C.gold : C.line, background: role === "chercheur" ? "#FBF3E7" : "transparent", color: C.ink }}>
                  {t(lang, "auth_role_seeker")}
                </button>
                <button type="button" onClick={() => setRole("bailleur")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: role === "bailleur" ? C.gold : C.line, background: role === "bailleur" ? "#FBF3E7" : "transparent", color: C.ink }}>
                  {t(lang, "auth_role_landlord")}
                </button>
              </div>
              {role === "bailleur" && (
                <p className="mt-1.5 text-xs" style={{ color: C.slate }}>
                  {t(lang, "auth_role_note")}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs" style={{ color: C.rust }}>{error}</p>}
          {notice && <p className="text-xs" style={{ color: C.green }}>{notice}</p>}

          <button disabled={busy} type="submit"
            className="clesch-focus mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: C.ink }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? t(lang, "auth_submit_login") : t(lang, "auth_submit_signup")}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setNotice(""); }}
          className="clesch-focus mt-3 w-full text-center text-xs font-medium"
          style={{ color: C.gold }}
        >
          {mode === "login" ? t(lang, "auth_switch_to_signup") : t(lang, "auth_switch_to_login")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Email link verification (free, unlimited, native Supabase Auth — click the link, no SMTP setup needed) ---------- */
function EmailVerification({ email, onVerified, lang }) {
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
      setError(err.message || t(lang, "ev_error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2" style={{ color: C.ink }}>
        <Mail size={18} />
        <h3 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{t(lang, "ev_title")}</h3>
      </div>
      <p className="mt-2 text-sm" style={{ color: C.slate }}>
        {t(lang, "ev_body", { email })}
      </p>

      {stage === "intro" && (
        <>
          {error && <p className="mt-2 text-xs" style={{ color: C.rust }}>{error}</p>}
          <button disabled={busy} onClick={sendLink}
            className="clesch-focus mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: C.ink }}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : t(lang, "ev_send")}
          </button>
        </>
      )}

      {stage === "sent" && (
        <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: "#EAF3EE", color: C.green }}>
          <CheckCircle2 size={16} className="mb-1" /> {t(lang, "ev_sent_body", { email })}
          <button onClick={sendLink} className="clesch-focus mt-2 flex text-xs underline" style={{ color: C.green }}>
            {t(lang, "ev_resend")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Identity verification gate for landlords/sellers ---------- */
function VerificationGate({ profile, userId, userEmail, onUpgradeRequested, onSubmitted, onEmailVerified, lang }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (profile.role === "chercheur") {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <UserCog size={22} className="mx-auto" style={{ color: C.slate }} />
        <p className="mt-2 text-sm" style={{ color: C.slate }}>
          {t(lang, "vg_seeker_body")}
        </p>
        <button
          onClick={onUpgradeRequested}
          className="clesch-focus mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: C.gold }}
        >
          {t(lang, "vg_become_landlord")}
        </button>
      </div>
    );
  }

  if (!profile.email_verified) {
    return <EmailVerification email={userEmail} onVerified={onEmailVerified} lang={lang} />;
  }

  if (profile.verification_status === "pending") {
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <Loader2 size={22} className="mx-auto animate-spin" style={{ color: C.gold }} />
        <p className="mt-2 text-sm" style={{ color: C.slate }}>
          {t(lang, "vg_pending_body")}
        </p>
      </div>
    );
  }

  if (profile.verification_status === "verified") return null;

  async function submit() {
    if (!file) { setError(t(lang, "vg_upload_error")); return; }
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
      setError(err.message || t(lang, "vg_upload_fail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2" style={{ color: C.ink }}>
        <ShieldQuestion size={18} />
        <h3 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{t(lang, "vg_title")}</h3>
      </div>
      {profile.verification_status === "rejected" && (
        <div className="mt-2 rounded-lg p-3 text-sm" style={{ background: "#F7EAE6", color: C.rust }}>
          {t(lang, "vg_rejected_prefix")}{profile.rejection_reason ? ` : ${profile.rejection_reason}` : "."} {t(lang, "vg_rejected_suffix")}
        </div>
      )}
      <p className="mt-2 text-sm" style={{ color: C.slate }}>
        {t(lang, "vg_upload_intro")}
      </p>
      <label className="clesch-focus mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm" style={{ borderColor: C.line, color: C.slate }}>
        <UploadCloud size={16} />
        {file ? file.name : t(lang, "vg_choose_file")}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      {error && <p className="mt-2 text-xs" style={{ color: C.rust }}>{error}</p>}
      <button disabled={busy} onClick={submit}
        className="clesch-focus mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: C.ink }}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : t(lang, "vg_submit")}
      </button>
    </div>
  );
}

/* ---------- Admin moderation panel ---------- */
function AdminPanel({ lang }) {
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

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [deletingAccountId, setDeletingAccountId] = useState(null);

  async function deleteAccount(id, email) {
    if (!window.confirm(t(lang, "admin_delete_account_confirm").replace("{email}", email))) return;
    setDeletingAccountId(id);
    const { data, error } = await supabase.functions.invoke("admin-delete-account", { body: { userId: id } });
    setDeletingAccountId(null);
    if (error || data?.error) {
      alert(data?.error || error?.message || t(lang, "admin_delete_account_error"));
      return;
    }
    loadAccounts();
  }

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, role, verification_status, email_verified, created_at")
      .order("created_at", { ascending: false });
    setAccounts(data || []);
    setAccountsLoading(false);
  }, []);

  const [analytics, setAnalytics] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [tabStats, setTabStats] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const [{ data: totals }, { data: daily }, { data: byTab }] = await Promise.all([
      supabase.rpc("site_analytics"),
      supabase.rpc("site_analytics_daily"),
      supabase.rpc("site_analytics_by_tab"),
    ]);
    setAnalytics(totals?.[0] || null);
    setDailyStats(daily || []);
    setTabStats(byTab || []);
    setAnalyticsLoading(false);
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
    if (!window.confirm(t(lang, "admin_delete_confirm"))) return;
    setDeletingId(id);
    await supabase.from("listings").delete().eq("id", id);
    setDeletingId(null);
    loadListingsAdmin();
  }

  useEffect(() => { load(); loadMessages(); loadListingsAdmin(); loadAnalytics(); loadAccounts(); }, [load, loadMessages, loadListingsAdmin, loadAnalytics, loadAccounts]);

  async function viewDocument(row) {
    if (!row.id_document_path) return;
    const { data } = await supabase.storage.from("id-documents").createSignedUrl(row.id_document_path, 300);
    if (data?.signedUrl) setDocUrls((m) => ({ ...m, [row.id]: data.signedUrl }));
  }

  async function decide(id, email, verification_status) {
    setBusyId(id);
    const reason = verification_status === "rejected" ? (rejectReason[id] || (lang === "en" ? "Illegible or non-compliant document." : "Document illisible ou non conforme.")) : null;
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
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "admin_title")}</p>
      <h1 className="mt-1 text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "admin_visitors_title")}</h1>

      {analyticsLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> {t(lang, "admin_loading")}</div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <p className="text-xs" style={{ color: C.slate }}>{t(lang, "admin_total_views")}</p>
              <p className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{analytics?.total_views ?? 0}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <p className="text-xs" style={{ color: C.slate }}>{t(lang, "admin_unique_visitors")}</p>
              <p className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{analytics?.unique_visitors ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>{t(lang, "admin_daily_title")}</p>
              {dailyStats.length === 0 ? (
                <p className="mt-2 text-xs" style={{ color: C.slate }}>{t(lang, "admin_no_data")}</p>
              ) : (
                <table className="mt-2 w-full text-xs">
                  <thead>
                    <tr style={{ color: C.slate }}>
                      <th className="py-1 text-left font-medium">{t(lang, "admin_col_date")}</th>
                      <th className="py-1 text-right font-medium">{t(lang, "admin_col_views")}</th>
                      <th className="py-1 text-right font-medium">{t(lang, "admin_col_visitors")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.map((d) => (
                      <tr key={d.day} style={{ borderTop: `1px solid ${C.line}` }}>
                        <td className="py-1" style={{ color: C.ink }}>{d.day}</td>
                        <td className="py-1 text-right" style={{ color: C.ink }}>{d.views}</td>
                        <td className="py-1 text-right" style={{ color: C.ink }}>{d.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.ink }}>{t(lang, "admin_by_page_title")}</p>
              {tabStats.length === 0 ? (
                <p className="mt-2 text-xs" style={{ color: C.slate }}>{t(lang, "admin_no_data")}</p>
              ) : (
                <table className="mt-2 w-full text-xs">
                  <thead>
                    <tr style={{ color: C.slate }}>
                      <th className="py-1 text-left font-medium">{t(lang, "admin_col_date")}</th>
                      <th className="py-1 text-right font-medium">{t(lang, "admin_col_views")}</th>
                      <th className="py-1 text-right font-medium">{t(lang, "admin_col_visitors")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabStats.map((r) => (
                      <tr key={r.tab} style={{ borderTop: `1px solid ${C.line}` }}>
                        <td className="py-1" style={{ color: C.ink }}>{r.tab}</td>
                        <td className="py-1 text-right" style={{ color: C.ink }}>{r.views}</td>
                        <td className="py-1 text-right" style={{ color: C.ink }}>{r.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      <h1 className="mt-10 text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "admin_pending_title")}</h1>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> {t(lang, "admin_loading")}</div>
      ) : pending.length === 0 ? (
        <div className="mt-4 rounded-xl border p-8 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          {t(lang, "admin_no_pending")}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {pending.map((row) => (
            <div key={row.id} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.ink }}>{row.email}</p>
                  <p className="text-xs" style={{ color: C.slate }}>{t(lang, "admin_status")} : {row.verification_status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => viewDocument(row)} className="clesch-focus rounded-lg border px-3 py-1.5 text-xs font-medium" style={{ borderColor: C.line, color: C.ink }}>
                    {t(lang, "admin_view_doc")}
                  </button>
                  <button disabled={busyId === row.id} onClick={() => decide(row.id, row.email, "verified")}
                    className="clesch-focus rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ background: C.green }}>
                    {t(lang, "admin_approve")}
                  </button>
                  <button disabled={busyId === row.id} onClick={() => decide(row.id, row.email, "rejected")}
                    className="clesch-focus rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ background: C.rust }}>
                    {t(lang, "admin_reject")}
                  </button>
                </div>
              </div>
              <input
                placeholder={t(lang, "admin_reject_reason_ph")}
                value={rejectReason[row.id] || ""}
                onChange={(e) => setRejectReason((m) => ({ ...m, [row.id]: e.target.value }))}
                className="clesch-focus mt-2 w-full rounded-lg border px-3 py-1.5 text-xs outline-none"
                style={{ borderColor: C.line }}
              />
              {docUrls[row.id] && (
                <a href={docUrls[row.id]} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: C.gold }}>
                  {t(lang, "admin_open_doc")} <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "admin_moderation")}</p>
      <h2 className="mt-1 text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "admin_listings_title")}</h2>

      {listingsLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> {t(lang, "admin_loading")}</div>
      ) : listings.length === 0 ? (
        <div className="mt-3 rounded-xl border p-6 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          {t(lang, "admin_no_listings")}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: C.ink }}>
                  {t(lang, `type_${l.type}`)} · {t(lang, `trans_${l.transaction}`)} — {l.city}, {l.country}
                </p>
                <p className="text-xs" style={{ color: C.slate }}>
                  {l.owner_name} · {l.phone} · {formatPrice(l.price)} € · {t(lang, "modal_ref").toLowerCase()} {l.id}
                </p>
              </div>
              <button disabled={deletingId === l.id} onClick={() => deleteListing(l.id)}
                className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" style={{ background: C.rust }}>
                <Trash2 size={13} /> {t(lang, "admin_delete")}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-10 font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "admin_moderation")}</p>
      <h2 className="mt-1 text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "admin_accounts_title")}</h2>

      {accountsLoading ? (
        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> {t(lang, "admin_loading")}</div>
      ) : accounts.length === 0 ? (
        <div className="mt-3 rounded-xl border p-6 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          {t(lang, "admin_no_accounts")}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl" style={{ border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm" style={{ background: C.card }}>
            <thead>
              <tr style={{ background: C.paper, color: C.slate }}>
                <th className="px-4 py-2.5 text-left font-medium">{t(lang, "admin_col_email")}</th>
                <th className="px-4 py-2.5 text-left font-medium">{t(lang, "admin_col_role")}</th>
                <th className="px-4 py-2.5 text-left font-medium">{t(lang, "admin_col_status")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t(lang, "admin_col_created")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t(lang, "dash_col_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="px-4 py-2.5" style={{ color: C.ink }}>{a.email}</td>
                  <td className="px-4 py-2.5" style={{ color: C.ink }}>{t(lang, `role_${a.role}`)}</td>
                  <td className="px-4 py-2.5">
                    {a.role === "bailleur" ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                        background: a.verification_status === "verified" ? "#EAF3EE" : a.verification_status === "rejected" ? "#F7EAE6" : "#FBF3E7",
                        color: a.verification_status === "verified" ? C.green : a.verification_status === "rejected" ? C.rust : C.gold,
                      }}>
                        {a.verification_status}
                      </span>
                    ) : (
                      <span style={{ color: C.slate }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs" style={{ color: C.slate }}>
                    {new Date(a.created_at).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {a.role === "admin" ? (
                      <span style={{ color: C.slate }}>—</span>
                    ) : (
                      <button disabled={deletingAccountId === a.id} onClick={() => deleteAccount(a.id, a.email)}
                        className="clesch-focus flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60" style={{ background: C.rust }}>
                        <Trash2 size={12} /> {t(lang, "dash_delete")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-10 font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "admin_support")}</p>
      <h2 className="mt-1 text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "admin_messages_title")}</h2>

      {messagesLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm" style={{ color: C.slate }}><Loader2 size={16} className="animate-spin" /> {t(lang, "admin_loading")}</div>
      ) : messages.length === 0 ? (
        <div className="mt-3 rounded-xl border p-6 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          {t(lang, "admin_no_messages")}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: C.ink }}>{m.email}</p>
                <p className="text-xs" style={{ color: C.slate }}>{new Date(m.created_at).toLocaleString(lang === "en" ? "en-GB" : "fr-FR")}</p>
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
function ContactModal({ defaultEmail, onClose, lang }) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !message.trim()) { setError(t(lang, "contact_error")); return; }
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
          <h3 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "contact_title")}</h3>
          <button onClick={onClose} className="clesch-focus" style={{ color: C.slate }}><X size={18} /></button>
        </div>

        {sent ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-lg p-4 text-center text-sm" style={{ background: "#EAF3EE", color: C.green }}>
            <CheckCircle2 size={20} />
            {t(lang, "contact_sent")} {email}.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-2.5">
            <p className="text-sm" style={{ color: C.slate }}>
              {t(lang, "contact_prompt")}
            </p>
            <div>
              <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "contact_email_label")}</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "contact_message_label")}</label>
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
                className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }}
                placeholder={t(lang, "contact_placeholder")} />
            </div>
            {error && <p className="text-xs" style={{ color: C.rust }}>{error}</p>}
            <button disabled={busy} type="submit"
              className="clesch-focus mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: C.ink }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : t(lang, "contact_send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Owner dashboard (views + unlocks per listing) ---------- */
/* ---------- Edit an existing listing (owner only) ---------- */
function EditListingModal({ listing, onClose, onSaved, lang }) {
  const d = listing.details || {};
  const [form, setForm] = useState({
    type: listing.type, transaction: listing.transaction, country: listing.country,
    city: listing.city, address: listing.address || "", price: listing.price,
    desc: listing.description, availableFrom: listing.available_from || "",
    subtype: d.subtype || "villa", aptSubtype: d.aptSubtype || "bilocale",
    bedrooms: d.bedrooms || "1", bathrooms: d.bathrooms || "1", hasLivingRoom: d.hasLivingRoom ?? true,
    showerType: d.showerType || "private", applianceCategory: d.applianceCategory || "electronique",
  });
  const [photos, setPhotos] = useState(listing.photos || []);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handlePhotoFiles(fileList) {
    const files = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);
    if (files.length === 0) return;
    setPhotoBusy(true);
    try {
      const next = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        next.push(await resizeImageFile(file));
      }
      setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
    } finally {
      setPhotoBusy(false);
    }
  }
  function removePhoto(i) { setPhotos((p) => p.filter((_, idx) => idx !== i)); }

  async function save() {
    setSaving(true);
    setError("");
    try {
      let details = {};
      if (form.type === "maison") {
        details = form.subtype === "appartement"
          ? { subtype: "appartement", aptSubtype: form.aptSubtype, bedrooms: form.bedrooms, bathrooms: form.bathrooms }
          : { subtype: "villa", bedrooms: form.bedrooms, hasLivingRoom: form.hasLivingRoom, bathrooms: form.bathrooms };
      } else if (form.type === "chambre") {
        details = { showerType: form.showerType };
      } else if (form.type === "appareils") {
        details = { applianceCategory: form.applianceCategory };
      }

      let lat = listing.lat, lng = listing.lng;
      if (form.address !== (listing.address || "") || form.city !== listing.city) {
        const { data: geo } = await supabase.functions.invoke("geocode-address", {
          body: { address: form.address, city: form.city, country: form.country },
        });
        if (geo?.lat) { lat = geo.lat; lng = geo.lng; }
      }

      const { error: err } = await supabase.from("listings").update({
        type: form.type, transaction: form.transaction, country: form.country,
        city: form.city, address: form.address, price: Number(form.price),
        description: form.desc, photos, details, lat, lng,
        available_from: form.type === "maison" && form.transaction === "location" ? (form.availableFrom || null) : null,
      }).eq("id", listing.id);
      if (err) throw err;
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(err.message || t(lang, "edit_error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-xl" style={{ background: C.card, maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "edit_title")}</h3>
          <button onClick={onClose} className="clesch-focus" style={{ color: C.slate }}><X size={18} /></button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_type")}</label>
            <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
              {Object.keys(TYPES).map((k) => <option key={k} value={k}>{t(lang, `type_${k}`)}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_transaction")}</label>
            <Select value={form.transaction} onChange={(e) => set("transaction", e.target.value)}>
              {Object.keys(TRANSACTIONS).map((k) => <option key={k} value={k}>{t(lang, `trans_${k}`)}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_country")}</label>
            <Select value={form.country} onChange={(e) => set("country", e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_city")}</label>
            <input value={form.city} onChange={(e) => set("city", e.target.value)}
              className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_address")}</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)}
              className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }} />
          </div>

          {form.type === "maison" && (
            <div className="col-span-2 rounded-lg p-3.5" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => set("subtype", "villa")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: form.subtype === "villa" ? C.gold : C.line, background: form.subtype === "villa" ? "#FBF3E7" : C.card, color: C.ink }}>
                  {t(lang, "subtype_villa")}
                </button>
                <button type="button" onClick={() => set("subtype", "appartement")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                  style={{ borderColor: form.subtype === "appartement" ? C.gold : C.line, background: form.subtype === "appartement" ? "#FBF3E7" : C.card, color: C.ink }}>
                  {t(lang, "subtype_appartement")}
                </button>
              </div>
              {form.subtype === "appartement" && (
                <Select value={form.aptSubtype} onChange={(e) => set("aptSubtype", e.target.value)}>
                  <option value="monolocale">{t(lang, "apt_monolocale")}</option>
                  <option value="bilocale">{t(lang, "apt_bilocale")}</option>
                  <option value="trilocale">{t(lang, "apt_trilocale")}</option>
                  <option value="quadrilocale">{t(lang, "apt_quadrilocale")}</option>
                </Select>
              )}
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
                  placeholder={t(lang, "add_bedrooms")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line, background: C.card }} />
                <input type="number" min="0" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
                  placeholder={t(lang, "add_bathrooms")}
                  className="clesch-focus rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line, background: C.card }} />
              </div>
              {form.transaction === "location" && (
                <input type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)}
                  className="clesch-focus mt-2.5 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line, background: C.card }} />
              )}
            </div>
          )}

          {form.type === "chambre" && (
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => set("showerType", "private")}
                className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: form.showerType === "private" ? C.gold : C.line, color: C.ink }}>
                {t(lang, "shower_private")}
              </button>
              <button type="button" onClick={() => set("showerType", "shared")}
                className="clesch-focus rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: form.showerType === "shared" ? C.gold : C.line, color: C.ink }}>
                {t(lang, "shower_shared")}
              </button>
            </div>
          )}

          {form.type === "appareils" && (
            <div className="col-span-2">
              <Select value={form.applianceCategory} onChange={(e) => set("applianceCategory", e.target.value)}>
                <option value="electronique">{t(lang, "appliance_electronique")}</option>
                <option value="electromenager">{t(lang, "appliance_electromenager")}</option>
                <option value="autre">{t(lang, "appliance_autre")}</option>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_price")}</label>
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
              className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_description")}</label>
            <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} rows={3}
              className="clesch-focus mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium" style={{ color: C.slate }}>{t(lang, "add_photos")}</label>
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
                <button onClick={() => fileInputRef.current?.click()} disabled={photoBusy}
                  className="clesch-focus flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg text-xs"
                  style={{ border: `1px dashed ${C.line}`, color: C.slate, background: C.paper }}>
                  {photoBusy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  {t(lang, "add_photos_add")}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden
                onChange={(e) => { handlePhotoFiles(e.target.files); e.target.value = ""; }} />
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-xs" style={{ color: C.rust }}>{error}</p>}
        {saved && <p className="mt-3 text-xs" style={{ color: C.green }}>{t(lang, "edit_saved")}</p>}

        <div className="mt-4 flex gap-2">
          <button disabled={saving} onClick={save}
            className="clesch-focus flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: C.ink }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : t(lang, "edit_save")}
          </button>
          <button onClick={onClose} className="clesch-focus rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            {t(lang, "edit_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Owner: incoming questions from seekers, before they unlock the contact ---------- */
function OwnerMessages({ lang }) {
  const [threads, setThreads] = useState([]); // grouped by listing_id + seeker_id
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listing_messages")
      .select("*, listings(city, country, type, transaction)")
      .order("created_at", { ascending: true });
    const grouped = {};
    (data || []).forEach((m) => {
      const key = `${m.listing_id}::${m.seeker_id}`;
      if (!grouped[key]) grouped[key] = { listingId: m.listing_id, seekerId: m.seeker_id, listing: m.listings, messages: [] };
      grouped[key].messages.push(m);
    });
    setThreads(Object.values(grouped).reverse());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function reply(listingId, seekerId) {
    const key = `${listingId}::${seekerId}`;
    const text = (replyText[key] || "").trim();
    if (!text) return;
    setSendingId(key);
    const { error } = await supabase.from("listing_messages").insert({
      listing_id: listingId, seeker_id: seekerId, from_owner: true, message: text,
    });
    if (!error) {
      supabase.functions.invoke("notify-listing-message", {
        body: { listingId, seekerId, fromOwner: true },
      }).then(null, () => {});
      setReplyText((r) => ({ ...r, [key]: "" }));
      load();
    }
    setSendingId(null);
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "add_landlord_gate_title")}</p>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "msg_inbox_title")}</h1>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: C.slate }}>
          <Loader2 size={16} className="animate-spin" /> {t(lang, "dash_loading")}
        </div>
      ) : threads.length === 0 ? (
        <div className="mt-6 rounded-xl border p-8 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          {t(lang, "msg_inbox_empty")}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {threads.map((th) => {
            const key = `${th.listingId}::${th.seekerId}`;
            return (
              <div key={key} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <p className="text-xs font-semibold" style={{ color: C.slate, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {th.listing ? `${t(lang, `type_${th.listing.type}`)} · ${th.listing.city}, ${th.listing.country}` : th.listingId}
                </p>
                <div className="mt-2 space-y-2">
                  {th.messages.map((m) => (
                    <div key={m.id} className="rounded-lg p-2.5 text-sm" style={{ background: m.from_owner ? "#EAF3EE" : C.paper, marginLeft: m.from_owner ? "10%" : 0, marginRight: m.from_owner ? 0 : "10%" }}>
                      <p className="text-xs font-medium" style={{ color: m.from_owner ? C.green : C.slate }}>
                        {m.from_owner ? t(lang, "msg_you_replied") : t(lang, "msg_from_seeker")}
                      </p>
                      <p style={{ color: C.ink }}>{m.message}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={replyText[key] || ""} onChange={(e) => setReplyText((r) => ({ ...r, [key]: e.target.value }))}
                    placeholder={t(lang, "msg_reply_placeholder")}
                    className="clesch-focus flex-1 rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: C.line }}
                    onKeyDown={(e) => { if (e.key === "Enter") reply(th.listingId, th.seekerId); }}
                  />
                  <button disabled={sendingId === key} onClick={() => reply(th.listingId, th.seekerId)}
                    className="clesch-focus rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: C.ink }}>
                    {sendingId === key ? <Loader2 size={15} className="animate-spin" /> : t(lang, "msg_send")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OwnerDashboard({ lang }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // full listing row being edited, or null
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("my_listings_with_stats");
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openEdit(id) {
    const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    if (data) setEditing(data);
  }

  async function deleteRow(id) {
    if (!window.confirm(t(lang, "dash_delete_confirm"))) return;
    setDeletingId(id);
    await supabase.from("listings").delete().eq("id", id);
    setDeletingId(null);
    load();
  }

  async function toggleStatus(id, currentStatus) {
    setTogglingId(id);
    await supabase.from("listings").update({
      status: currentStatus === "active" ? "unavailable" : "active",
    }).eq("id", id);
    setTogglingId(null);
    load();
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "add_landlord_gate_title")}</p>
      <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "dash_title")}</h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: C.slate }}>{t(lang, "dash_subtitle")}</p>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: C.slate }}>
          <Loader2 size={16} className="animate-spin" /> {t(lang, "dash_loading")}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-xl border p-8 text-center text-sm" style={{ borderColor: C.line, color: C.slate }}>
          {t(lang, "dash_empty")}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl" style={{ border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm" style={{ background: C.card }}>
            <thead>
              <tr style={{ background: C.paper, color: C.slate }}>
                <th className="px-4 py-2.5 text-left font-medium">{t(lang, "dash_col_listing")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t(lang, "dash_col_price")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t(lang, "dash_col_views")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t(lang, "dash_col_unlocks")}</th>
                <th className="px-4 py-2.5 text-center font-medium">{t(lang, "dash_status")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t(lang, "dash_col_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: `1px solid ${C.line}`, opacity: r.status === "unavailable" ? 0.6 : 1 }}>
                  <td className="px-4 py-2.5">
                    <div style={{ color: C.ink }}>
                      {t(lang, `type_${r.type}`)} · {t(lang, `trans_${r.transaction}`)} — {r.city}
                    </div>
                    <div className="text-xs" style={{ color: C.slate, fontFamily: "'IBM Plex Mono', monospace" }}>{r.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right" style={{ color: C.ink }}>{formatPrice(r.price)} €</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: C.ink }}>{r.views_count}</td>
                  <td className="px-4 py-2.5 text-right font-semibold" style={{ color: C.green }}>{r.unlocks_count}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: r.status === "active" ? "#EAF3EE" : "#F7EAE6", color: r.status === "active" ? C.green : C.rust }}>
                      {r.status === "active" ? t(lang, "dash_active") : t(lang, "dash_unavailable")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button disabled={togglingId === r.id} onClick={() => toggleStatus(r.id, r.status)}
                        className="clesch-focus rounded-lg border px-2.5 py-1 text-xs font-medium disabled:opacity-60" style={{ borderColor: C.line, color: C.ink }}>
                        {r.status === "active" ? t(lang, "dash_mark_unavailable") : t(lang, "dash_mark_available")}
                      </button>
                      <button onClick={() => openEdit(r.id)} className="clesch-focus rounded-lg border px-2.5 py-1 text-xs font-medium" style={{ borderColor: C.line, color: C.ink }}>
                        {t(lang, "dash_edit")}
                      </button>
                      <button disabled={deletingId === r.id} onClick={() => deleteRow(r.id)}
                        className="clesch-focus flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60" style={{ background: C.rust }}>
                        <Trash2 size={12} /> {t(lang, "dash_delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditListingModal
          listing={editing}
          lang={lang}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
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
  const [lang, setLang] = useState(() => localStorage.getItem("clesch-lang") || "fr");
  useEffect(() => { localStorage.setItem("clesch-lang", lang); }, [lang]);

  const [tab, setTab] = useState("how"); // how | browse | add | history | premium | admin

  /* ---- Anonymous, privacy-friendly visit tracking (no personal data) ---- */
  useEffect(() => {
    let sid = localStorage.getItem("clesch-sid");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("clesch-sid", sid);
    }
    supabase.from("page_views").insert({ session_id: sid, tab }).then(null, () => {});
  }, [tab]);

  const [listings, setListings] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  const [unlocked, setUnlocked] = useState({}); // listing id -> true
  const [active, setActive] = useState(null);

  function openListing(l) {
    setActive(l);
    window.history.pushState(null, "", `/annonce/${l.id}`);
  }

  function closeListing() {
    setActive(null);
    window.history.pushState(null, "", "/");
  }
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");
  const [fType, setFType] = useState("all");
  const [fTrans, setFTrans] = useState("all");
  const [fCountry, setFCountry] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [appliedPriceMin, setAppliedPriceMin] = useState("");
  const [savedSearches, setSavedSearches] = useState([]);
  const [alertSaved, setAlertSaved] = useState(false);

  const loadSavedSearches = useCallback(async (uid) => {
    if (!uid) { setSavedSearches([]); return; }
    const { data } = await supabase.from("saved_searches").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setSavedSearches(data || []);
  }, []);

  async function createAlert() {
    if (!session) { setAuthModal("login"); return; }
    setAlertSaved(false);
    await supabase.from("saved_searches").insert({
      user_id: session.user.id,
      email: session.user.email,
      type: fType,
      transaction: fTrans,
      country: fCountry,
      price_min: appliedPriceMin || null,
      price_max: appliedPriceMax || null,
    });
    setAlertSaved(true);
    loadSavedSearches(session.user.id);
  }

  async function deleteAlert(id) {
    await supabase.from("saved_searches").delete().eq("id", id);
    loadSavedSearches(session?.user?.id);
  }

  const [appliedPriceMax, setAppliedPriceMax] = useState("");
  const [fSubtype, setFSubtype] = useState("all");
  const [fMinBedrooms, setFMinBedrooms] = useState("");
  const [fShowerType, setFShowerType] = useState("all");
  const [fApplianceCategory, setFApplianceCategory] = useState("all");

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
          address: l.address,
          lat: l.lat,
          lng: l.lng,
          price: l.price,
          owner: l.owner_name,
          phone: l.phone,
          desc: l.description,
          verified: true,
          photos: l.photos || [],
          details: l.details || {},
          availableFrom: l.available_from,
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

  /* ---- Favorites (saved listings) ---- */
  const [favorites, setFavorites] = useState({}); // listing id -> true
  const loadFavorites = useCallback(async (uid) => {
    if (!uid) { setFavorites({}); return; }
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", uid);
    const map = {};
    (data || []).forEach((r) => (map[r.listing_id] = true));
    setFavorites(map);
  }, []);

  async function toggleFavorite(listingId) {
    if (!session) { setAuthModal("login"); return; }
    if (favorites[listingId]) {
      setFavorites((f) => { const next = { ...f }; delete next[listingId]; return next; });
      await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("listing_id", listingId);
    } else {
      setFavorites((f) => ({ ...f, [listingId]: true }));
      await supabase.from("favorites").insert({ user_id: session.user.id, listing_id: listingId });
    }
  }

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

  /* ---- Deep link support: /annonce/:id opens that listing directly ---- */
  useEffect(() => {
    const match = window.location.pathname.match(/^\/annonce\/(.+)$/);
    if (!match || listings.length === 0 || active) return;
    const found = listings.find((l) => l.id === match[1]);
    if (found) {
      setActive(found);
      setTab("browse");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);
  useEffect(() => { loadUnlocks(session?.user?.id); }, [session, loadUnlocks]);
  useEffect(() => { loadFavorites(session?.user?.id); }, [session, loadFavorites]);
  useEffect(() => { loadSavedSearches(session?.user?.id); }, [session, loadSavedSearches]);
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
      address: listing.address,
      lat: listing.lat,
      lng: listing.lng,
      price: Number(listing.price),
      owner_name: listing.owner,
      phone: listing.phone,
      description: listing.desc,
      photos: listing.photos || [],
      details: listing.details || {},
      available_from: listing.availableFrom || null,
    });
    setSaving(false);
    if (error) return false;
    await loadListings();
    supabase.functions.invoke("notify-saved-searches", { body: { listingId: id } }).then(null, () => {});
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
      if (appliedPriceMin !== "" && Number(l.price) < Number(appliedPriceMin)) return false;
      if (appliedPriceMax !== "" && Number(l.price) > Number(appliedPriceMax)) return false;
      const d = l.details || {};
      if (fType === "maison" && fSubtype !== "all" && d.subtype !== fSubtype) return false;
      if (fType === "maison" && fMinBedrooms !== "" && Number(d.bedrooms || 0) < Number(fMinBedrooms)) return false;
      if (fType === "chambre" && fShowerType !== "all" && d.showerType !== fShowerType) return false;
      if (fType === "appareils" && fApplianceCategory !== "all" && d.applianceCategory !== fApplianceCategory) return false;
      if (q && !(`${l.city} ${l.country} ${l.desc}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [listings, fType, fTrans, fCountry, q, appliedPriceMin, appliedPriceMax, fSubtype, fMinBedrooms, fShowerType, fApplianceCategory]);

  const unlockedList = listings.filter((l) => unlocked[l.id]);
  const favoritesList = listings.filter((l) => favorites[l.id]);
  const isAdmin = profile?.role === "admin";
  const isVerifiedLandlord = (profile?.role === "bailleur" && profile?.verification_status === "verified") || hasActiveSubscription;

  const NAV_ITEMS = [
    ["how", t(lang, "nav_how")],
    ["browse", t(lang, "nav_browse")],
    ["map", t(lang, "nav_map")],
    ["add", t(lang, "nav_post")],
    ["guides", t(lang, "nav_guides")],
    ["premium", t(lang, "nav_premium")],
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
          <button onClick={() => setTab("favorites")}
            className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
            style={{ background: tab === "favorites" ? C.gold : "transparent" }}>
            <Heart size={14} /> {t(lang, "nav_favorites")}
            {favoritesList.length > 0 && (
              <span className="ml-0.5 rounded-full px-1.5 text-xs" style={{ background: "rgba(255,255,255,0.2)" }}>{favoritesList.length}</span>
            )}
          </button>
          <button onClick={() => setTab("history")}
            className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
            style={{ background: tab === "history" ? C.gold : "transparent" }}>
            {t(lang, "nav_contacts")}
            {unlockedList.length > 0 && (
              <span className="ml-0.5 rounded-full px-1.5 text-xs" style={{ background: "rgba(255,255,255,0.2)" }}>{unlockedList.length}</span>
            )}
          </button>
          {profile?.role === "bailleur" && (
            <button onClick={() => setTab("dashboard")}
              className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
              style={{ background: tab === "dashboard" ? C.gold : "transparent" }}>
              {t(lang, "nav_dashboard")}
            </button>
          )}
          {profile?.role === "bailleur" && (
            <button onClick={() => setTab("messages")}
              className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
              style={{ background: tab === "messages" ? C.gold : "transparent" }}>
              <MessageCircle size={14} /> {t(lang, "nav_messages")}
            </button>
          )}
          <button onClick={() => setContactOpen(true)}
            className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium">
            <MessageCircleQuestion size={14} /> {t(lang, "nav_contact_us")}
          </button>
          {isAdmin && (
            <button onClick={() => setTab("admin")}
              className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium"
              style={{ background: tab === "admin" ? C.gold : "transparent" }}>
              <UserCog size={14} /> {t(lang, "nav_admin")}
            </button>
          )}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label={t(lang, "language_label")}
            className="clesch-focus rounded-lg py-1.5 pl-2 pr-1 text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "none" }}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} style={{ color: C.ink }}>{l.label}</option>
            ))}
          </select>
          {!authLoading && (session ? (
            <>
              <span className="hidden text-xs sm:inline" style={{ color: "rgba(255,255,255,0.75)" }}>{session.user.email}</span>
              <button onClick={signOut} className="clesch-focus flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium" style={{ background: "rgba(255,255,255,0.12)" }}>
                <LogOut size={14} /> {t(lang, "logout")}
              </button>
            </>
          ) : (
            <button onClick={() => setAuthModal("login")} className="clesch-focus rounded-lg px-3 py-1.5 font-medium" style={{ background: "rgba(255,255,255,0.12)" }}>
              {t(lang, "login")}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {tab === "how" && <HowItWorks goTo={setTab} lang={lang} />}

        {tab === "browse" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>Étape 1 — Trouver</p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "browse_title")}</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: C.slate }}>
              {t(lang, "browse_subtitle")}
            </p>

            <div className="mb-5 mt-5 flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1" style={{ minWidth: "180px" }}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "search_placeholder")}
                  className="clesch-focus w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                  style={{ borderColor: C.line, background: C.card }} />
              </div>
              <Select value={fType} onChange={(e) => setFType(e.target.value)}>
                <option value="all">{t(lang, "filter_all_type")}</option>
                {Object.keys(TYPES).map((k) => <option key={k} value={k}>{t(lang, `type_${k}`)}</option>)}
              </Select>
              <Select value={fTrans} onChange={(e) => setFTrans(e.target.value)}>
                <option value="all">{t(lang, "filter_all_trans")}</option>
                {Object.keys(TRANSACTIONS).map((k) => <option key={k} value={k}>{t(lang, `trans_${k}`)}</option>)}
              </Select>
              <Select value={fCountry} onChange={(e) => setFCountry(e.target.value)}>
                <option value="all">{t(lang, "filter_all_country")}</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <input
                type="number" min="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                placeholder={t(lang, "filter_price_min")}
                className="clesch-focus w-28 rounded-lg border py-2 px-3 text-sm outline-none"
                style={{ borderColor: C.line, background: C.card }}
              />
              <input
                type="number" min="0" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                placeholder={t(lang, "filter_price_max")}
                className="clesch-focus w-28 rounded-lg border py-2 px-3 text-sm outline-none"
                style={{ borderColor: C.line, background: C.card }}
              />
              <button
                onClick={() => { setAppliedPriceMin(priceMin); setAppliedPriceMax(priceMax); }}
                className="clesch-focus flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: C.ink }}
              >
                <Search size={14} /> {t(lang, "search_button")}
              </button>
              <button
                onClick={createAlert}
                className="clesch-focus flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: C.gold, color: C.gold }}
              >
                <Mail size={14} /> {t(lang, "alert_create")}
              </button>
            </div>

            {fType === "maison" && (
              <div className="mb-5 -mt-2 flex flex-wrap items-center gap-2.5">
                <Select value={fSubtype} onChange={(e) => setFSubtype(e.target.value)}>
                  <option value="all">{t(lang, "add_house_subtype")}</option>
                  <option value="villa">{t(lang, "subtype_villa")}</option>
                  <option value="appartement">{t(lang, "subtype_appartement")}</option>
                </Select>
                <input
                  type="number" min="0" value={fMinBedrooms} onChange={(e) => setFMinBedrooms(e.target.value)}
                  placeholder={t(lang, "filter_min_bedrooms")}
                  className="clesch-focus w-32 rounded-lg border py-2 px-3 text-sm outline-none"
                  style={{ borderColor: C.line, background: C.card }}
                />
              </div>
            )}

            {fType === "chambre" && (
              <div className="mb-5 -mt-2 flex flex-wrap items-center gap-2.5">
                <Select value={fShowerType} onChange={(e) => setFShowerType(e.target.value)}>
                  <option value="all">{t(lang, "add_shower_type")}</option>
                  <option value="private">{t(lang, "shower_private")}</option>
                  <option value="shared">{t(lang, "shower_shared")}</option>
                </Select>
              </div>
            )}

            {fType === "appareils" && (
              <div className="mb-5 -mt-2 flex flex-wrap items-center gap-2.5">
                <Select value={fApplianceCategory} onChange={(e) => setFApplianceCategory(e.target.value)}>
                  <option value="all">{t(lang, "add_appliance_category")}</option>
                  <option value="electronique">{t(lang, "appliance_electronique")}</option>
                  <option value="electromenager">{t(lang, "appliance_electromenager")}</option>
                  <option value="autre">{t(lang, "appliance_autre")}</option>
                </Select>
              </div>
            )}

            {alertSaved && (
              <p className="mb-4 flex items-center gap-1.5 text-xs" style={{ color: C.green }}>
                <CheckCircle2 size={13} /> {t(lang, "alert_saved")}
              </p>
            )}

            {savedSearches.length > 0 && (
              <div className="mb-5 rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <p className="text-xs font-semibold" style={{ color: C.ink }}>{t(lang, "alert_my_alerts")}</p>
                <div className="mt-2 space-y-1.5">
                  {savedSearches.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs" style={{ color: C.slate }}>
                      <span>
                        {s.type && s.type !== "all" ? t(lang, `type_${s.type}`) : t(lang, "alert_summary_any")} ·{" "}
                        {s.transaction && s.transaction !== "all" ? t(lang, `trans_${s.transaction}`) : t(lang, "alert_summary_any")} ·{" "}
                        {s.country && s.country !== "all" ? s.country : t(lang, "alert_summary_any")}
                        {(s.price_min || s.price_max) ? ` · ${s.price_min || "0"}–${s.price_max || "∞"} €` : ""}
                      </span>
                      <button onClick={() => deleteAlert(s.id)} className="clesch-focus" style={{ color: C.rust }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dbLoading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm" style={{ color: C.slate }}>
                <Loader2 size={16} className="animate-spin" /> {t(lang, "loading_listings")}
              </div>
            )}

            {dbError && !dbLoading && (
              <div className="mb-4 rounded-lg p-3 text-sm" style={{ background: "#F7EAE6", color: C.rust }}>
                {t(lang, "db_error")}
              </div>
            )}

            {!dbLoading && (
              <>
                <p className="mb-3 text-xs" style={{ color: C.slate }}>{filtered.length} {t(lang, "results_found")}</p>
                {filtered.length === 0 ? (
                  <div className="rounded-xl border p-8 text-center" style={{ borderColor: C.line, color: C.slate }}>
                    {t(lang, "no_results")}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((l) => (
                      <ListingCard key={l.id} listing={l} unlocked={l.contactVisible} onOpen={openListing} lang={lang} favorited={!!favorites[l.id]} onToggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "add" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "add_landlord_gate_title")}</p>
            {!session ? (
              <div className="mt-4 rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <Lock size={20} className="mx-auto" style={{ color: C.slate }} />
                <p className="mt-2 text-sm" style={{ color: C.slate }}>{t(lang, "add_landlord_login_prompt")}</p>
                <button onClick={() => setAuthModal("signup")} className="clesch-focus mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  {t(lang, "add_create_account")}
                </button>
              </div>
            ) : !profile ? (
              <div className="mt-4 flex items-center justify-center gap-2 py-16 text-sm" style={{ color: C.slate }}>
                <Loader2 size={16} className="animate-spin" /> {t(lang, "add_loading_account")}
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
                  lang={lang}
                />
              </div>
            ) : (
              <>
                <div className="mt-4 rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                  <AddListingForm onSubmit={handleAddListing} saving={saving} lang={lang} />
                </div>
                <button onClick={() => setTab("premium")} className="clesch-focus mt-4 flex items-center gap-1.5 text-sm font-medium" style={{ color: C.gold }}>
                  <Sparkles size={14} /> {t(lang, "add_premium_cta")}
                </button>
              </>
            )}
          </div>
        )}

        {tab === "map" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "browse_title")}</p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "nav_map")}</h1>
            <div className="mt-5">
              <ListingsMap listings={listings} lang={lang} onOpen={openListing} />
            </div>
          </div>
        )}

        {tab === "guides" && <CountryGuides lang={lang} />}

        {tab === "terms" && <LegalPage content={TERMS_CONTENT} lang={lang} />}
        {tab === "privacy" && <LegalPage content={PRIVACY_CONTENT} lang={lang} />}

        {tab === "premium" && (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: C.rust }}>{t(lang, "add_landlord_gate_title")}</p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "premium_title")}</h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: C.slate }}>
              {t(lang, "premium_subtitle")}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: C.green }}>
              <ShieldCheck size={13} /> {t(lang, "modal_secure_payment")}.
            </p>
            {hasActiveSubscription && (
              <p className="mt-3 flex items-center gap-1.5 rounded-lg p-3 text-sm" style={{ background: "#EAF3EE", color: C.green }}>
                <CheckCircle2 size={15} /> {t(lang, "premium_active_note")}
              </p>
            )}

            {!session ? (
              <div className="mt-4 rounded-xl p-6 text-center" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <Lock size={20} className="mx-auto" style={{ color: C.slate }} />
                <p className="mt-2 text-sm" style={{ color: C.slate }}>{t(lang, "premium_login_prompt")}</p>
                <button onClick={() => setAuthModal("login")} className="clesch-focus mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  {t(lang, "login")}
                </button>
              </div>
            ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.key} className="flex flex-col rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2" style={{ color: C.gold }}>
                    <Sparkles size={16} />
                    <span className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, `plan_${p.key}`)}</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm" style={{ color: C.slate }}>{t(lang, `plan_${p.key}_tagline`)}</p>
                  <ul className="mt-3 space-y-1 text-xs" style={{ color: C.slate }}>
                    <li>• {t(lang, "premium_benefit_1")}</li>
                    <li>• {t(lang, "premium_benefit_2")}</li>
                    <li>• {t(lang, "premium_benefit_3")}</li>
                  </ul>
                  <a href={`${p.url}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="clesch-focus mt-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
                    style={{ background: C.ink }}>
                    {t(lang, "premium_subscribe")} <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {tab === "favorites" && (
          <div>
            <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "favorites_title")}</h2>
            {!session ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border p-10 text-center" style={{ borderColor: C.line, color: C.slate }}>
                <Heart size={20} />
                {t(lang, "favorites_login_prompt")}
                <button onClick={() => setAuthModal("login")} className="clesch-focus mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  {t(lang, "login")}
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm" style={{ color: C.slate }}>{t(lang, "favorites_subtitle")}</p>
                {favoritesList.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border p-10 text-center" style={{ borderColor: C.line, color: C.slate }}>
                    <Heart size={22} />
                    {t(lang, "favorites_empty")}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favoritesList.map((l) => (
                      <ListingCard key={l.id} listing={l} unlocked={l.contactVisible} onOpen={openListing} lang={lang} favorited={!!favorites[l.id]} onToggleFavorite={toggleFavorite} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "history" && (
          <div>
            <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif", color: C.ink }}>{t(lang, "history_title")}</h2>
            {!session ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border p-10 text-center" style={{ borderColor: C.line, color: C.slate }}>
                <Lock size={20} />
                {t(lang, "history_login_prompt")}
                <button onClick={() => setAuthModal("login")} className="clesch-focus mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.gold }}>
                  {t(lang, "login")}
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm" style={{ color: C.slate }}>
                  {t(lang, "history_subtitle")}
                </p>
                {unlockedList.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border p-10 text-center" style={{ borderColor: C.line, color: C.slate }}>
                    <ListChecks size={22} />
                    {t(lang, "history_empty")}
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

        {tab === "dashboard" && profile?.role === "bailleur" && <OwnerDashboard lang={lang} />}

        {tab === "messages" && profile?.role === "bailleur" && <OwnerMessages lang={lang} />}

        {tab === "admin" && isAdmin && <AdminPanel lang={lang} />}
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 pt-4 text-xs" style={{ color: C.slate }}>
        <p>{t(lang, "footer_tagline")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button onClick={() => setTab("terms")} className="clesch-focus underline">{t(lang, "footer_terms")}</button>
          <button onClick={() => setTab("privacy")} className="clesch-focus underline">{t(lang, "footer_privacy")}</button>
          <span>© {new Date().getFullYear()} CléSchengen. {t(lang, "footer_rights")}</span>
        </div>
      </footer>

      <CookieBanner lang={lang} onOpenPrivacy={() => setTab("privacy")} />

      {active && (
        <ListingModal
          listing={active}
          unlocked={active.contactVisible}
          session={session}
          onClose={closeListing}
          onUnlock={handleUnlock}
          onRequireAuth={() => setAuthModal("login")}
          lang={lang}
          allListings={listings}
          favorited={!!favorites[active.id]}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} lang={lang} />}

      {contactOpen && <ContactModal defaultEmail={session?.user?.email} onClose={() => setContactOpen(false)} lang={lang} />}
    </div>
  );
}
