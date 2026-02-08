export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ ok: false, error: "Nedostaje code." }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code },
    select: { status: true, discountPct: true },
  });

  if (!promo) {
    return NextResponse.json({ ok: true, exists: false, valid: false });
  }

  return NextResponse.json({
    ok: true,
    exists: true,
    valid: promo.status === "UNUSED",
    status: promo.status,
    discountPct: promo.discountPct,
  });
}
