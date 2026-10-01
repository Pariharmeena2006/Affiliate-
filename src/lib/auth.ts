import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models";

function sessionSecret() {
  const value = process.env.JWT_SECRET;
  if (!value && process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be configured in production.");
  return new TextEncoder().encode(value || "local-development-secret-change-before-deploy-123456");
}
const cookieName = "affiliate_admin_session";
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId, role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(sessionSecret());
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}
export async function clearSession() { (await cookies()).delete(cookieName); }
export async function getAdmin() {
  try {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, sessionSecret());
    await connectDB();
    return await AdminUser.findOne({ _id: payload.sub, active: true }).select("username email role").lean();
  } catch { return null; }
}
export async function requireAdmin() { const admin = await getAdmin(); if (!admin) throw new Error("Unauthorized"); return admin; }
