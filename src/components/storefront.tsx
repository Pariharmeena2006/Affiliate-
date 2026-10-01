import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star, ExternalLink } from "lucide-react";
import { money } from "@/lib/format";

type Product = { _id?: string; name: string; slug: string; brand?: string; images?: string[]; salePrice?: number; originalPrice?: number; rating?: number; reviewCount?: number; deal?: boolean; merchant?: { name?: string; slug?: string; primaryColor?: string } };
export function ProductCard({ product }: { product: Product }) {
 const discount = product.originalPrice && product.salePrice ? Math.round((1 - product.salePrice / product.originalPrice) * 100) : 0;
 return <article className="product-card group overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
  <Link href={`/product/${product.slug}`} className="image-frame relative block aspect-[4/4.5] overflow-hidden bg-[#f6f4ef]" aria-label={`View ${product.name}`}>
   {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-stone-300">No image</div>}
   {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#e4573d] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">{discount}% OFF</span>}
   {product.deal && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#252820]">TODAY&apos;S PICK</span>}
  </Link>
  <div className="p-3.5 sm:p-4">
   <div className="mb-1.5 flex items-center justify-between gap-2"><span className="truncate text-[10px] font-bold uppercase tracking-[.16em] text-[#7b806f]">{product.brand || "Editor select"}</span><span className="merchant-pill">{product.merchant?.name}</span></div>
   <Link href={`/product/${product.slug}`} className="line-clamp-2 min-h-10 text-[13px] font-semibold leading-5 text-[#252820] hover:text-[#b05538] sm:text-sm">{product.name}</Link>
   <div className="mt-2 flex items-center gap-1 text-[11px] text-[#68705b]"><Star size={12} fill="currentColor"/><span className="font-semibold">{product.rating?.toFixed(1) || "New"}</span><span className="text-stone-400">({product.reviewCount || 0})</span></div>
   <div className="mt-2 flex items-baseline gap-2"><strong className="text-base text-[#252820]">{money(product.salePrice)}</strong>{product.originalPrice && <span className="text-xs text-stone-400 line-through">{money(product.originalPrice)}</span>}</div>
   <Link href={`/api/go/${product.slug}`} className="deal-button mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-[#263c31] text-[10px] font-bold tracking-[.14em] text-white transition hover:bg-[#385b47]">VIEW DEAL <ArrowUpRight size={14}/></Link>
  </div>
 </article>
}
export function SectionHeading({ eyebrow, title, subtitle, href }: { eyebrow?: string; title: string; subtitle?: string; href?: string }) { return <div className="mb-5 flex items-end justify-between gap-3 sm:mb-7"><div><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#b15c3c]">{eyebrow}</p><h2 className="font-display text-2xl font-semibold tracking-tight text-[#252820] sm:text-3xl">{title}</h2>{subtitle && <p className="mt-1.5 text-sm text-[#7b806f]">{subtitle}</p>}</div>{href && <Link href={href} className="hidden items-center gap-1 text-xs font-semibold text-[#455f4e] hover:underline sm:flex">Explore all <ExternalLink size={13}/></Link>}</div> }
