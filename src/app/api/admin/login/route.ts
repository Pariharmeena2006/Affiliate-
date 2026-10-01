import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
 try {
  const { login, password } = await request.json();
  if (typeof login !== "string" || typeof password !== "string" || password.length > 256) return NextResponse.json({ error: "Enter your username/email and password." }, { status: 400 });
  await connectDB();
  const user = await AdminUser.findOne({ $or: [{ email: login.toLowerCase() }, { username: login }], active: true });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  await createSession(String(user._id));
  return NextResponse.json({ ok: true });
 } catch { return NextResponse.json({ error: "Login unavailable. Check database configuration." }, { status: 500 }); }
}
