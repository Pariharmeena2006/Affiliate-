import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Category, Merchant, Product } from "@/models";
import { ProductCard, SectionHeading } from "@/components/storefront";
import { getMerchantTheme } from "@/lib/merchant-themes";
export const dynamic = "force-dynamic";
export default async function MerchantCategoryPage({ params }: { params: Promise<{ merchant: string; slug: string[] }> }) {
 const { merchant: merchantSlug, slug } = await params;
 await connectDB();
 const merchant = await Merchant.findOne({ slug: merchantSlug, active: true }).lean();
 const category = await Category.findOne({ slug: slug.at(-1), active: true }).lean();
 if (!merchant || !category) notFound();
 const theme = getMerchantTheme(merchantSlug, merchant.primaryColor);
 const palette = { "--merchant-accent": theme.accent, "--merchant-strong": theme.accentStrong, "--merchant-ink": theme.ink, "--merchant-canvas": theme.canvas, "--merchant-soft": theme.soft, "--merchant-line": theme.line } as CSSProperties;
 const descendantIds = [category._id];
 for (let depth = 0; depth < 12; depth++) {
  const childIds = await Category.find({ parent: { $in: descendantIds }, active: true }).distinct("_id");
  const newIds = childIds.filter((id) => !descendantIds.some((existing) => String(existing) === String(id)));
  if (!newIds.length) break;
  descendantIds.push(...newIds);
 }
 const [children, products] = await Promise.all([
  Category.find({ parent: category._id, active: true }).sort({ displayOrder: 1 }).lean(),
  Product.find({ merchant: merchant._id, category: { $in: descendantIds }, status: "published" }).populate("merchant", "name slug").sort({ featured: -1, displayOrder: 1, createdAt: -1 }).limit(48).lean(),
 ]);
 const data = JSON.parse(JSON.stringify({ merchant, category, children, products }));
 return <div className={`merchant-store merchant-store-${theme.key}`} style={palette}><div className="site-width merchant-content py-7 sm:py-10"><div className="mb-7 rounded-2xl border border-[var(--merchant-line)] bg-[var(--merchant-soft)] p-6 sm:p-10"><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold text-stone-500"><Link href={`/${merchantSlug}`}>{data.merchant.name}</Link><span>/</span>{data.category.name}</div><p className="merchant-eyebrow">{theme.label.toUpperCase()} · CATEGORY COLLECTION</p><h1 className="mt-3 font-display text-3xl font-semibold text-[var(--merchant-ink)] sm:text-5xl">{data.category.name} <span className="text-[var(--merchant-strong)]">from {data.merchant.name}</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{data.category.description || `Thoughtful ${data.category.name.toLowerCase()} finds curated from ${data.merchant.name}.`}</p></div>{data.children.length>0&&<div className="flex flex-wrap gap-2 pb-6">{data.children.map((child:any)=><Link key={child._id} className="rounded-full border border-[var(--merchant-line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--merchant-ink)] transition hover:border-[var(--merchant-accent)]" href={`/${merchantSlug}/${slug.concat(child.slug).join("/")}`}>{child.name} <ArrowRight size={12} className="ml-1 inline"/></Link>)}</div>}<section className="py-3"><SectionHeading eyebrow={`${data.merchant.name} · ${theme.label}`} title={`${data.category.name} finds`} subtitle={`${data.products.length} picks to browse`}/><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{data.products.map((product:any)=><ProductCard key={product._id} product={product}/>)}</div>{!data.products.length&&<p className="rounded-2xl border border-dashed border-[var(--merchant-line)] p-10 text-center text-sm text-stone-500">No finds in this retailer category just yet.</p>}</section></div></div>;
}
