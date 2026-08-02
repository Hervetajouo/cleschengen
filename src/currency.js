// Taux de change approximatifs par rapport à l'euro, pour donner une
// estimation aux visiteurs dont la devise habituelle n'est pas l'euro.
// ⚠️ Ce sont des taux FIXES, mis à jour manuellement de temps en temps —
// ce n'est PAS un taux de change en temps réel. Toujours afficher comme
// "estimation", jamais comme un montant exact à payer.
export const CURRENCY_RATES = {
  EUR: { rate: 1, symbol: "€" },
  USD: { rate: 1.09, symbol: "$" },
  GBP: { rate: 0.86, symbol: "£" },
  CHF: { rate: 0.95, symbol: "CHF" },
  SEK: { rate: 11.4, symbol: "kr" },
  NOK: { rate: 11.7, symbol: "kr" },
  DKK: { rate: 7.46, symbol: "kr" },
  PLN: { rate: 4.3, symbol: "zł" },
  CZK: { rate: 25.1, symbol: "Kč" },
  HUF: { rate: 393, symbol: "Ft" },
  RON: { rate: 4.98, symbol: "lei" },
  BGN: { rate: 1.96, symbol: "лв" },
  ISK: { rate: 150, symbol: "kr" },
};

export const CURRENCY_LABELS = Object.keys(CURRENCY_RATES);

export function convertPrice(priceInEur, currency) {
  const c = CURRENCY_RATES[currency] || CURRENCY_RATES.EUR;
  const converted = priceInEur * c.rate;
  const rounded = converted >= 100 ? Math.round(converted) : Math.round(converted * 100) / 100;
  return `${rounded.toLocaleString("fr-FR")} ${c.symbol}`;
}
