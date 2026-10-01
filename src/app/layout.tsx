import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { connectDB } from "@/lib/db";
import { Merchant, SiteSettings, ThemeSettings } from "@/models";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const display = Playfair_Display({ variable: "--font-display", subsets: ["latin"] });
export const metadata: Metadata = { title: { default: "Found & Fine — Finds worth finding", template: "%s | Found & Fine" }, description: "A considered edit of things worth finding. Discover thoughtful picks and shop directly with trusted retailers." };
async function getShellData() { try { await connectDB(); const [merchants, theme, settings] = await Promise.all([Merchant.find({ active: true }).select("name slug").sort({ displayOrder: 1 }).lean(), ThemeSettings.findOne({ key: "global" }).lean(), SiteSettings.findOne({ key: "global" }).lean()]); return { merchants: JSON.parse(JSON.stringify(merchants)), theme: JSON.parse(JSON.stringify(theme || {})), settings: JSON.parse(JSON.stringify(settings || {})) }; } catch { return { merchants: [], theme: {}, settings: {} }; } }
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 const { merchants, theme, settings } = await getShellData();
 const style = { "--background": theme.backgroundColor || "#fbfaf7", "--foreground": theme.textColor || "#252820", "--green": theme.primaryColor || "#263c31", "--rust": theme.accentColor || "#b15c3c", "--card-color": theme.cardColor || "#ffffff", "--radius": theme.borderRadius || "16px" } as CSSProperties;
 return <html lang="en" data-scroll-behavior="smooth"><body style={style} className={`${sans.variable} ${display.variable}`}><AppShell merchants={merchants} settings={settings}>{children}</AppShell></body></html>;
}
