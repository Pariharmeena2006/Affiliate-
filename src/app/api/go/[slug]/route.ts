import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { ClickEvent, Product } from "@/models";
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
 try {
  await connectDB(); const { slug } = await params; const product = await Product.findOne({ slug, status: "published" }).populate("merchant", "_id").lean();
  if (!product?.affiliateUrl) return NextResponse.redirect(new URL("/", request.url));
  const h = await headers(); const agent = h.get("user-agent") || ""; const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const visitorHash = ip ? createHash("sha256").update(`${ip}:${process.env.JWT_SECRET || "affiliate"}`).digest("hex") : undefined;
  await Promise.all([ClickEvent.create({ product: product._id, merchant: (product.merchant as unknown as { _id: unknown })._id, category: product.category, referrer: h.get("referer")?.slice(0, 500), device: /mobile/i.test(agent) ? "mobile" : "desktop", userAgent: agent.slice(0, 500), visitorHash }), Product.updateOne({ _id: product._id }, { $inc: { clickCount: 1 } })]);
  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
 } catch { return NextResponse.redirect(new URL("/", request.url)); }
}
