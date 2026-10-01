import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { dashboardMetrics, publicFilter, resourceModel } from "@/lib/resources";

export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params;
    await connectDB();
    if (resource === "analytics") { await requireAdmin(); return NextResponse.json(await dashboardMetrics()); }
    const Model = resourceModel(resource);
    if (!Model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    const admin = await (async () => { try { await requireAdmin(); return true; } catch { return false; } })();
    const query = request.nextUrl.searchParams;
    const filter: Record<string, any> = admin ? {} : publicFilter(resource, query);
    if (admin && resource === "products") {
      if (query.has("q")) filter.$or = ["name", "brand", "sku", "slug"].map((key) => ({ [key]: new RegExp(query.get("q")!, "i") }));
      for (const key of ["status", "merchant", "category", "brand"]) if (query.has(key) && query.get(key) !== "all") filter[key] = key === "brand" ? new RegExp(query.get(key)!, "i") : query.get(key);
      for (const key of ["featured", "trending", "deal"]) if (query.has(key)) filter[key] = query.get(key) === "true";
    } else if (admin && query.has("q")) {
      filter.$or = ["name", "title", "slug", "type"].map((key) => ({ [key]: new RegExp(query.get("q")!, "i") }));
    }
    const page = Math.max(1, Number(query.get("page") || 1));
    const limit = Math.min(60, Math.max(1, Number(query.get("limit") || 20)));
    const sortKey = query.get("sort") || "createdAt";
    const sortMap: Record<string, any> = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, priceAsc: { salePrice: 1 }, priceDesc: { salePrice: -1 }, discount: { salePrice: 1, originalPrice: -1 }, rating: { rating: -1 }, popular: { clickCount: -1 }, order: { displayOrder: 1 } };
    let cursor = Model.find(filter).sort(sortMap[sortKey] || { displayOrder: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    if (!admin && resource === "products") cursor = cursor.select("-affiliateUrl -originalUrl");
    if (!admin && resource === "merchants") cursor = cursor.select("-affiliateBaseUrl");
    if (resource === "products") cursor = cursor.populate("merchant", "name slug primaryColor").populate("category", "name slug parent");
    if (resource === "categories") cursor = cursor.populate("parent", "name slug");
    if (resource === "banners") cursor = cursor.populate("merchant", "name slug").populate("category", "name slug");
    if (resource === "homepage") cursor = cursor.populate("productIds", "name slug images salePrice originalPrice rating").populate("categoryIds", "name slug image");
    const [items, total] = await Promise.all([cursor.lean(), Model.countDocuments(filter)]);
    if (query.get("format") === "list") return NextResponse.json(items);
    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 }); }
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    await requireAdmin(); await connectDB();
    const { resource } = await params; const Model = resourceModel(resource);
    if (!Model || resource === "analytics") return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
    const body = await request.json();
    if (resource === "products" && body.affiliateUrl) { const url = new URL(body.affiliateUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Affiliate URL must use http or https"); }
    if (["theme", "settings"].includes(resource)) { const item = await Model.findOneAndUpdate({ key: "global" }, { ...body, key: "global" }, { upsert: true, new: true, runValidators: true }); return NextResponse.json(item, { status: 201 }); }
    const item = await Model.create(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save item" }, { status: 400 }); }
}
