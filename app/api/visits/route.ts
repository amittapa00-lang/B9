import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const path = typeof body?.path === "string" ? body.path : null;
    const visitorId =
      typeof body?.visitorId === "string" ? body.visitorId : null;

    await prisma.pageVisit.create({
      data: { path, visitorId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}