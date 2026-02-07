import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const accessCode = String(form.get("accessCode") || "").trim();

  if (!email || !accessCode) {
    return NextResponse.json({ ok: false, error: "Nedostaju podaci." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findFirst({
    where: {
      email,
      accessCode,
    },
    select: { accessCode: true },
  });

  if (!reservation) {
    return NextResponse.json({ ok: false, error: "Karta nije pronađena (proveri email i šifru)." }, { status: 404 });
  }

  return NextResponse.redirect(new URL(`/manage/${reservation.accessCode}?email=${encodeURIComponent(email)}`, req.url));
}
