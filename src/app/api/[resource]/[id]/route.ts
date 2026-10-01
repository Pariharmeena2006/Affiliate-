import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { resourceModel } from "@/lib/resources";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
 try { await requireAdmin(); await connectDB(); const { resource, id } = await params; const Model = resourceModel(resource); if (!Model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 }); const body = await request.json(); delete body._id; delete body.createdAt; if (resource === "products" && body.affiliateUrl) { const url = new URL(body.affiliateUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Affiliate URL must use http or https"); } const item = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: true }); return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
 catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update" }, { status: 400 }); }
}
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
 try { await requireAdmin(); await connectDB(); const { resource, id } = await params; const Model = resourceModel(resource); if (!Model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 }); await Model.findByIdAndDelete(id); return NextResponse.json({ ok: true }); }
 catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete" }, { status: 400 }); }
}
