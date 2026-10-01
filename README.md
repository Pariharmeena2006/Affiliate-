# Found & Fine — Affiliate discovery

A database-driven affiliate product discovery website. Found & Fine does not sell products: product CTAs record an outbound click and send visitors to the merchant's affiliate URL. Orders, fulfilment, payments, and returns stay with the merchant.

## Stack and structure

- Next.js App Router, React, TypeScript, Tailwind CSS
- MongoDB with Mongoose schemas and indexes
- Admin login: bcrypt password hashes + signed, HTTP-only JWT cookie
- Next.js route handlers for CRUD APIs, analytics, sessions and tracked redirects
- App routes: `src/app`, shared UI: `src/components`, persistence: `src/models`, seed: `scripts/seed.ts`

## Requirements

- Node.js 20.19+ (or a supported current LTS release; Next.js requires Node 20.9+)
- npm
- Internet access the first time the local development database downloads its MongoDB binary; or MongoDB 6+ / MongoDB Atlas for a separately managed database

## Local installation

1. From this folder, install dependencies with `npm install`.
2. Run `npm run dev`. On first launch it downloads a macOS Ventura-compatible MongoDB 7 binary, starts an isolated persistent local database under `.local-mongo-data-7`, seeds the demo collection and admin login, then starts Next.js at `http://localhost:3000`.
3. Sign in at `http://localhost:3000/admin/login` with `editor@example.com` / `FoundFine-Local-2026!` for local-only demo use. Override `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` in `.env.local` before launching if preferred.

For a separately managed MongoDB, set `DATABASE_URL` in `.env.local`; `npm run dev` will use that database instead of launching the embedded local server. The embedded demo database persists between starts in `.local-mongo-data-7` and is only for local development.

The demo affiliate URLs use `https://example.com/demo-affiliate/...` deliberately. Replace them before launch; they are not real affiliate links.

## Database and seed behavior

The seed script is repeatable: it upserts four retailers, 50 categories (8 parent categories + 42 children), 30 demo products, a banner, a homepage product section, four legal/editorial pages, global theme/site settings, and the admin user if the admin environment variables are set. Demo image URLs use public Unsplash source images. MongoDB creates the product text index and the merchant/category/status/slug indexes from the schemas.

## Admin operations

- Products: open **Products → Add product**. Provide name/slug, retailer, category, prices, original product URL, and the **affiliate tracking URL**. Use **Upload images** to select any number of product photos (25 per batch; repeat batches as needed); files are checked, resized, stripped of metadata and saved as WebP under `public/uploads/products`. Images show in product cards and the full detail gallery. Use status `published` for immediate storefront display; featured/trending/deal flags drive homepage collections. Edit/delete and individual image removal are available in the editor.
- Categories: add a top-level category or select an existing parent to create a nested subcategory. Repeat nesting is represented by the `parent` reference in MongoDB. Images and SEO fields are editable.
- Merchants: add a retailer, slug, logo/banner, website URL, affiliate base URL, description, active state and display order. Merchant pages are resolved by slug and their products by database reference; names are never used to hard-code a retailer list.
- Banners: add a banner with an image URL, title, optional subtitle and button destination. Active banners can supply the home hero.
- Homepage: add product sections; add product IDs (MongoDB IDs, one per line), title and visibility. Sections are ordered by display order. Home also queries live published/trending/deal items.
- Theme / site settings: edit colors, preset, radius, logo, announcement, global metadata and search settings. Theme settings are persisted in MongoDB and core global color tokens, header announcement/logo, and search placeholder read them on page render; review other hard-coded component accents before promising a complete white-label theme.
- Pages: edit legal/editorial content, SEO values and published state. Content is rendered as text (not executable HTML) to avoid stored-XSS risk.
- Analytics: click-through totals and top products/retailers are aggregated from `ClickEvent` records.

## Affiliate tracking

Product cards and detail-page CTAs link to `/api/go/{product-slug}`. The handler only resolves a published product, stores product/merchant/category, time, referrer, user-agent/device and an SHA-256 hash of the forwarded IP (not raw IP), increments the product click counter, then responds with a 302 redirect to `affiliateUrl`. If the product cannot be resolved, the visitor returns to the homepage. Configure trusted proxy behavior before relying on forwarded IP headers. Country is not inferred without a geolocation provider.

## API overview

- Public read: `GET /api/products`, `/api/categories`, `/api/merchants`, `/api/banners`, `/api/homepage`, `/api/pages` (published/active only; pagination via `page` and `limit`). Product query supports `q`, `merchant`, `category`, `brand`, price/rating bounds, and flags.
- Admin CRUD: `POST /api/{products,categories,merchants,banners,homepage,pages,theme,settings}`; `PATCH|DELETE /api/{resource}/{id}`. Mutations require an authenticated admin session.
- Sessions: `POST /api/admin/login`, `POST /api/admin/logout`.
- Analytics: authenticated `GET /api/analytics`.
- Tracked outbound: `GET /api/go/{product-slug}`.

## Build and deployment

- Development: `npm run dev`
- Lint: `npm run lint`
- Production build: `npm run build`
- Production server: `npm run start`

Deploy to a Node.js hosting service that supports Next.js route handlers (for example, a Node host or a compatible Next deployment platform). Provision MongoDB, set all environment variables in the hosting service's secret manager, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL, use a high-entropy `JWT_SECRET`, run `npm run build`, and deploy the `.next` output using the provider's Next.js integration or `npm run start`. Restrict MongoDB network access to the deployed app. Use a managed image CDN/object store for uploaded media; this first version uses URL fields only. Ensure your chosen platform supports Next.js 16 and Node 20.19+.

## Production hardening checklist

This is a functional starter, not a security/compliance certification. Before public launch, configure TLS, strong unique secrets, database backups and least-privilege access; add login and public API rate limiting/WAF; review affiliate-program terms and legal text with counsel; wire real affiliate links; monitor click abuse; add complete cookie/privacy consent as applicable; connect theme settings to the public CSS variables; move uploaded media to durable object storage/CDN if deploying on an ephemeral/serverless host; configure email and password reset; add automated API/UI tests and deployment monitoring. Local uploads are saved to the project public directory and persist on a normal local/server filesystem; deployments with read-only or ephemeral filesystems must use object storage instead. Admin cookies are HTTP-only, secure in production, same-site lax and expire after eight hours. Admin users can be rotated from the seed environment; user CRUD and self-service password changes are not implemented in this initial build.
