import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILES_PER_BATCH = 25;
const MAX_DIMENSION = 2200;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const files = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (files.length === 0) return NextResponse.json({ error: "Select one or more image files first." }, { status: 400 });
    if (files.length > MAX_FILES_PER_BATCH) return NextResponse.json({ error: `Upload up to ${MAX_FILES_PER_BATCH} images per batch. You can upload more batches to the same product.` }, { status: 413 });

    const outputDirectory = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(outputDirectory, { recursive: true });
    const uploaded: { url: string; width: number; height: number; originalName: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: `${file.name} is larger than the 15 MB limit.` }, { status: 413 });
      const input = Buffer.from(await file.arrayBuffer());
      const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "error" });
      const metadata = await image.metadata();
      if (!metadata.format || !["jpeg", "png", "webp", "avif", "tiff"].includes(metadata.format)) {
        return NextResponse.json({ error: `${file.name} is not a supported image. Use JPEG, PNG, WebP, AVIF or TIFF.` }, { status: 415 });
      }
      const output = await image.rotate().resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toBuffer({ resolveWithObject: true });
      const filename = `${randomUUID()}.webp`;
      await writeFile(path.join(outputDirectory, filename), output.data, { flag: "wx" });
      uploaded.push({ url: `/uploads/products/${filename}`, width: output.info.width, height: output.info.height, originalName: file.name.slice(0, 180) });
    }

    return NextResponse.json({ images: uploaded }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    const unauthorized = message === "Unauthorized";
    return NextResponse.json({ error: unauthorized ? "Please sign in as an administrator to upload images." : message }, { status: unauthorized ? 401 : 400 });
  }
}
