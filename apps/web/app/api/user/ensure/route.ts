import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, email, name, image } = body || {}
    if (!id || !email) {
      return NextResponse.json({ ok: false, error: "missing id or email" }, { status: 400 })
    }
    await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name: name || null,
        image: image || null
      },
      create: {
        id,
        email,
        name: name || null,
        image: image || null
      }
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 })
  }
}
