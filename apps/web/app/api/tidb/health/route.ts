import { NextResponse } from "next/server"
import { getTiDBPool } from "@/lib/tidb"

export async function GET() {
  try {
    const pool = getTiDBPool()
    const [rowsVersion] = await pool.query("SELECT VERSION() AS version")
    const [rowsNow] = await pool.query("SELECT NOW() AS now")
    const version = Array.isArray(rowsVersion) && rowsVersion[0] && (rowsVersion[0] as any).version
    const now = Array.isArray(rowsNow) && rowsNow[0] && (rowsNow[0] as any).now
    return NextResponse.json({ ok: true, version, now })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 })
  }
}
