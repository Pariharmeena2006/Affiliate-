export type MerchantTheme = {
  key: string;
  accent: string;
  accentStrong: string;
  ink: string;
  canvas: string;
  soft: string;
  line: string;
  label: string;
  headline: string;
  description: string;
  motif: string;
};

const themes: Record<string, MerchantTheme> = {
  amazon: { key: "amazon", accent: "#efad38", accentStrong: "#b56e12", ink: "#14212e", canvas: "#f5f7f8", soft: "#e8eef2", line: "#d8e0e6", label: "The everyday edit", headline: "Make room for the useful.", description: "Everyday upgrades, smart essentials and little things that make a difference.", motif: "sunrise" },
  flipkart: { key: "flipkart", accent: "#2876dc", accentStrong: "#1356ad", ink: "#142e50", canvas: "#f3f7fd", soft: "#e5efff", line: "#d4e2f5", label: "The value edit", headline: "Good finds. Bright ideas.", description: "A lively mix of clever picks, useful tech and excellent everyday value.", motif: "orbit" },
  myntra: { key: "myntra", accent: "#e45c91", accentStrong: "#b83468", ink: "#35242d", canvas: "#fff6f8", soft: "#fbe5ed", line: "#f2d8e1", label: "The style edit", headline: "Wear the feeling.", description: "A little inspiration for getting dressed, picked from the latest style finds.", motif: "petal" },
  meesho: { key: "meesho", accent: "#cb4d76", accentStrong: "#9f3159", ink: "#37252b", canvas: "#fff7f6", soft: "#f9e7e3", line: "#efd9d5", label: "The delightful edit", headline: "Lovely things, lovely prices.", description: "Small joys for your wardrobe and home, found at feel-good prices.", motif: "soft-check" },
};

export function getMerchantTheme(slug: string, merchantColor?: string): MerchantTheme {
  const base = themes[slug.toLowerCase()] || themes.amazon;
  if (!merchantColor || !/^#[0-9a-f]{6}$/i.test(merchantColor)) return base;
  return { ...base, accent: merchantColor, accentStrong: merchantColor };
}
