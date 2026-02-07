import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

function int(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function POST(req: Request) {
  const form = await req.formData();

  const showId = String(form.get("showId") || "");
  const fullName = String(form.get("fullName") || "");
  const email = String(form.get("email") || "");
  const regionId = String(form.get("regionId") || "");
  const qty = int(form.get("qty")) ?? 1;

  if (!showId || !fullName || !email || !regionId) {
    return NextResponse.json({ ok: false, error: "Nedostaju podaci." }, { status: 400 });
  }
  if (qty < 1 || qty > 20) {
    return NextResponse.json({ ok: false, error: "Neispravna količina." }, { status: 400 });
  }

  const price = await prisma.showPrice.findUnique({
    where: { showId_regionId: { showId, regionId } },
    include: { region: true, show: true },
  });

  if (!price) {
    return NextResponse.json({ ok: false, error: "Cena za region nije pronađena." }, { status: 404 });
  }

  const unitPriceRsd = price.priceRsd;
  const lineTotalRsd = unitPriceRsd * qty;

  const accessCode = randomUUID();

  const reservation = await prisma.reservation.create({
    data: {
      showId,
      fullName,
      email,
      accessCode,
      totalRsd: lineTotalRsd,
      currencyCode: "RSD",
      items: {
        create: [
          {
            regionId,
            qty,
            unitPriceRsd,
            lineTotalRsd,
          },
        ],
      },
    },
    select: { accessCode: true },
  });

  return NextResponse.redirect(
  new URL(`/reservation-success/${reservation.accessCode}`, req.url)
);

}
