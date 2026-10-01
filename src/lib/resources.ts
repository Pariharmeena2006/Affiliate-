import { Banner, Category, ClickEvent, HomepageSection, Merchant, Page, Product, SiteSettings, ThemeSettings } from "@/models";
export const collections: Record<string, any> = { products: Product, categories: Category, merchants: Merchant, banners: Banner, pages: Page, homepage: HomepageSection, theme: ThemeSettings, settings: SiteSettings };
export const resourceModel = (name: string) => collections[name];
export function publicFilter(name: string, query: URLSearchParams) {
  if (name === "products") {
    const filter: Record<string, any> = { status: "published" };
    if (query.has("merchant")) filter.merchant = query.get("merchant");
    if (query.has("category")) filter.category = query.get("category");
    if (query.has("featured")) filter.featured = query.get("featured") === "true";
    if (query.has("trending")) filter.trending = query.get("trending") === "true";
    if (query.has("deal")) filter.deal = query.get("deal") === "true";
    if (query.has("brand")) filter.brand = new RegExp(query.get("brand")!, "i");
    if (query.has("q")) filter.$text = { $search: query.get("q") };
    if (query.has("minPrice") || query.has("maxPrice")) filter.salePrice = { ...(query.has("minPrice") ? { $gte: Number(query.get("minPrice")) } : {}), ...(query.has("maxPrice") ? { $lte: Number(query.get("maxPrice")) } : {}) };
    if (query.has("minRating")) filter.rating = { $gte: Number(query.get("minRating")) };
    return filter;
  }
  if (name === "merchants" || name === "categories") return { active: true };
  if (name === "banners") return { active: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: new Date() } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: new Date() } }] }] };
  if (name === "pages") return { published: true };
  if (name === "homepage") return { visible: true };
  if (name === "theme" || name === "settings") return { key: "global" };
  return {};
}
export async function dashboardMetrics() {
 const [totalProducts, published, drafts, categories, merchants, totalClicks, clicksToday, clicksWeek, clicksMonth, recentClicks] = await Promise.all([
  Product.countDocuments(), Product.countDocuments({ status: "published" }), Product.countDocuments({ status: "draft" }), Category.countDocuments(), Merchant.countDocuments(), ClickEvent.countDocuments(),
  ClickEvent.countDocuments({ timestamp: { $gte: new Date(new Date().setHours(0,0,0,0)) } }), ClickEvent.countDocuments({ timestamp: { $gte: new Date(Date.now()-7*86400000) } }), ClickEvent.countDocuments({ timestamp: { $gte: new Date(Date.now()-30*86400000) } }),
  ClickEvent.find().sort({ timestamp: -1 }).limit(12).populate("product", "name slug").populate("merchant", "name slug").lean()
 ]);
 const topProducts = await ClickEvent.aggregate([{ $group: { _id: "$product", clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }, { $limit: 5 }, { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } }, { $unwind: "$product" }, { $project: { name: "$product.name", slug: "$product.slug", clicks: 1 } }]);
 const merchantClicks = await ClickEvent.aggregate([{ $group: { _id: "$merchant", clicks: { $sum: 1 } } }, { $lookup: { from: "merchants", localField: "_id", foreignField: "_id", as: "merchant" } }, { $unwind: "$merchant" }, { $project: { name: "$merchant.name", slug: "$merchant.slug", clicks: 1 } }]);
 const trendRows = await ClickEvent.aggregate([{ $match: { timestamp: { $gte: new Date(Date.now() - 13 * 86400000) } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, clicks: { $sum: 1 } } }]);
 const trendByDate = new Map(trendRows.map((row: { _id: string; clicks: number }) => [row._id, row.clicks]));
 const clickTrend = Array.from({ length: 14 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - 13 + index); const day = date.toISOString().slice(0, 10); return { day, clicks: trendByDate.get(day) || 0 }; });
 return { totalProducts, published, drafts, categories, merchants, totalClicks, clicksToday, clicksWeek, clicksMonth, topProducts, merchantClicks, recentClicks, clickTrend };
}
