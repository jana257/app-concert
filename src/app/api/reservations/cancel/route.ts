import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const accessCode = String(form.get("accessCode") || "").trim();

  console.log("CANCEL REQUEST:", { email, accessCode }); 

  if (!email || !accessCode) {
    return NextResponse.json({ ok: false, error: "Nedostaju podaci." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findFirst({
    where: { email, accessCode },
    select: { id: true, status: true },
  });

  if (!reservation) {
    return NextResponse.json({ ok: false, error: "Karta nije pronađena." }, { status: 404 });
  }

  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ ok: false, error: "Karta je već otkazana." }, { status: 400 });
  }

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.redirect(
    new URL(`/manage/${accessCode}?email=${encodeURIComponent(email)}&cancelled=1`, req.url)
  );
}
