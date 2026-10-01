import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgePercent, Compass, Sparkles, Star } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Banner, Category, HomepageSection, Merchant, Product } from "@/models";
import { ProductCard, SectionHeading } from "@/components/storefront";

export const dynamic = "force-dynamic";
async function getHomeData() {
  await connectDB();
  const [merchants,categories,banners,featured,trending,deals,sections] = await Promise.all([
    Merchant.find({active:true}).sort({displayOrder:1}).lean(),
    Category.find({active:true,parent:null}).sort({displayOrder:1}).limit(8).lean(),
    Banner.find({active:true,$or:[{startsAt:null},{startsAt:{$lte:new Date()}}]}).sort({displayOrder:1}).limit(3).lean(),
    Product.find({status:"published",featured:true}).populate("merchant","name slug primaryColor").sort({displayOrder:1,createdAt:-1}).limit(4).lean(),
    Product.find({status:"published",trending:true}).populate("merchant","name slug primaryColor").sort({displayOrder:1,createdAt:-1}).limit(8).lean(),
    Product.find({status:"published",deal:true}).populate("merchant","name slug primaryColor").sort({displayOrder:1}).limit(8).lean(),
    HomepageSection.find({visible:true}).populate("productIds").populate("categoryIds").sort({displayOrder:1}).lean(),
  ]);
  return JSON.parse(JSON.stringify({merchants,categories,banners,featured,trending,deals,sections}));
}
const categoryArt=[
 {image:"photo-1490481651871-ab68de25d43d",kicker:"Wear what feels like you",tone:"#dce5da"},
 {image:"photo-1518770660439-4636190af475",kicker:"Small things, smart tech",tone:"#dce5ef"},
 {image:"photo-1616486338812-3dadae4b4ace",kicker:"Make home more yours",tone:"#e8dfd0"},
 {image:"photo-1608248543803-ba4f8c70ae0b",kicker:"A softer kind of ritual",tone:"#f0dfe3"},
 {image:"photo-1543163521-1bf539c55dd2",kicker:"Everyday, elevated",tone:"#e9e0d8"},
 {image:"photo-1517841905240-472988babdf9",kicker:"Little finishing touches",tone:"#eadde1"},
 {image:"photo-1494438639946-1ebd1d20bf85",kicker:"Comfort in the details",tone:"#e5dfd5"},
 {image:"photo-1513364776144-60967b0f800f",kicker:"Ideas worth keeping",tone:"#e3e3d9"},
];
export default async function Home(){
 const data=await getHomeData();const hero=data.banners[0];const heroImage=hero?.image||"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=90";
 return <div className="home-editorial">
  <section className="site-width home-hero-wrap"><div className="home-hero">
  <div className="home-hero-copy"><div className="home-edition"><span className="edition-dot"/> THE FINDS EDIT <span className="edition-divider"/> VOL. 04 · EVERYDAY JOY</div><h1>{hero?.title||<>Things worth<br/><em>finding.</em></>}</h1><p>{hero?.subtitle||"A thoughtful little shortcut to the pieces you’ll love living with. Beautifully found, all in one place."}</p><div className="hero-actions"><Link href={hero?.buttonUrl||"/category/fashion"} className="hero-primary">{hero?.buttonText||"Explore the edit"}<ArrowRight size={16}/></Link><Link href="/deals" className="hero-secondary">See what’s on offer <ArrowDownRight size={15}/></Link></div><div className="hero-note"><span className="note-star"><Star size={13} fill="currentColor"/></span><span>Curated with care.<br/><b>Always shop with the retailer.</b></span></div></div>
  <div className="home-hero-art"><Image src={heroImage} alt={hero?.title||"Thoughtfully curated style and home finds"} fill priority unoptimized={Boolean(hero?.image&&!hero.image.startsWith("/"))} sizes="(max-width: 1024px) 100vw, 58vw" className="hero-main-photo"/><div className="hero-image-wash"/><div className="hero-image-caption"><span>01 / THE CURRENT MOOD</span><span>Soft forms · Considered details</span></div><div className="hero-floating-card"><span className="floating-icon"><Sparkles size={15}/></span><span><b>A good find</b><small>can change your day.</small></span></div><span className="hero-index">F.</span></div>
  </div><div className="hero-underbar"><span><Compass size={14}/> A more considered way to browse</span><span>Independent discovery · Retailer-direct shopping</span></div></section>
  <section className="site-width retailer-strip"><div className="retailer-intro"><span className="section-kicker">FOUR GOOD PLACES TO START</span><h2>Meet your <em>go-to</em> shops.</h2></div><div className="retailer-list">{data.merchants.map((merchant:any,index:number)=><Link key={merchant._id} href={`/${merchant.slug}`} className={`retailer-link retailer-link-${merchant.slug}`}><span className="retailer-number">0{index+1}</span><span className="retailer-name">{merchant.name}</span><ArrowUpRight size={16}/></Link>)}</div></section>
  <section className="site-width home-categories"><div className="section-topline"><div><span className="section-kicker">A LITTLE INSPIRATION</span><h2>Find your kind <em>of lovely.</em></h2><p>Browse the things you love, from every retailer we love.</p></div><Link href="/category/fashion" className="text-link">Browse every category <ArrowRight size={14}/></Link></div><div className="category-editorial-grid">{data.categories.map((category:any,index:number)=>{const art=categoryArt[index%categoryArt.length];return <Link key={category._id} href={`/category/${category.slug}`} className={`category-editorial category-editorial-${index%4}`} style={{"--category-tone":art.tone} as React.CSSProperties}><Image src={category.image||`https://images.unsplash.com/${art.image}?auto=format&fit=crop&w=1000&q=82`} alt="" fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="category-photo"/><span className="category-shade"/><span className="category-index">0{index+1}</span><span className="category-copy"><small>{art.kicker}</small><b>{category.name}</b></span><span className="category-arrow"><ArrowUpRight size={17}/></span></Link>})}</div></section>
  {data.sections.map((section:any)=><section key={section._id} className="site-width home-products-section"><SectionHeading eyebrow={section.type?.replaceAll("-"," ")} title={section.title||"A few good things"} subtitle={section.subtitle}/><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{section.productIds?.slice(0,8).map((product:any)=><ProductCard key={product._id} product={product}/>)}</div></section>)}
  <section className="site-width featured-edit"><div className="featured-edit-heading"><span className="section-kicker">THE EDITORS’ SHORTLIST</span><h2>Picked for <em>the little things.</em></h2><p>Standout finds with something extra. No endless scrolling required.</p><Link href="/deals" className="text-link">Meet all our picks <ArrowRight size={14}/></Link><span className="featured-big-number">04</span></div><div className="featured-product-grid">{data.featured.map((product:any,index:number)=><div key={product._id} className={`featured-product featured-product-${index}`}><ProductCard product={product}/></div>)}{!data.featured.length&&<div className="featured-empty">Our next shortlist is taking shape.<br/><span>Come back for a fresh edit soon.</span></div>}</div></section>
  <section className="site-width home-trending"><div className="section-topline"><div><span className="section-kicker">A LITTLE BUZZ</span><h2>What’s catching <em>our eye.</em></h2><p>The finds people are loving right now.</p></div><Link href="/deals" className="text-link">See all the good stuff <ArrowRight size={14}/></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{data.trending.map((product:any)=><ProductCard key={product._id} product={product}/>)}</div></section>
  <section className="site-width deal-feature"><div className="deal-feature-art"><Image src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85" alt="A colourful curated collection" fill sizes="(max-width: 768px) 100vw, 45vw"/><span className="deal-stamp"><BadgePercent size={22}/><b>GOOD<br/>FINDS</b></span></div><div className="deal-feature-copy"><span className="section-kicker">A LITTLE TREAT, FOR LESS</span><h2>The good<br/><em>deal list.</em></h2><p>Lovely finds, lovely prices. A rotating little collection of discounts from shops you already trust.</p><Link href="/deals" className="hero-primary">Find your deal <ArrowRight size={16}/></Link><span className="deal-footnote">Prices are shown by the retailer and may change.</span></div></section>
  <section className="site-width home-disclosure"><span className="disclosure-spark"><Sparkles size={17}/></span><p><b>Good finds. Full transparency.</b><br/>Some links are affiliate links. If you shop through them, we may earn a commission at no extra cost to you. You always buy directly from the retailer.</p><Link href="/page/affiliate-disclosure" aria-label="Read our affiliate disclosure"><ArrowUpRight size={17}/></Link></section>
 </div>
}
