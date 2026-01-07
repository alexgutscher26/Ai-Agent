import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });
    }
    const normEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normEmail } });
    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, name, bio, image, theme } = body || {};
    if (!email) {
      return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });
    }
    const normEmail = String(email).trim().toLowerCase();
    const updated = await prisma.user.update({
      where: { email: normEmail },
      data: {
        name: name ?? undefined,
        bio: bio ?? undefined,
        image: image ?? undefined,
        theme: theme ?? undefined
      }
    });
    return NextResponse.json({ ok: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
