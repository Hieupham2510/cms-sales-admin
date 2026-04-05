import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API hoạt động bình thường",
    timestamp: new Date().toISOString(),
  })
}
