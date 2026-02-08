import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { assertCapacityOrThrow } from "@/lib/capacity";
import { getDiscountUntil } from "@/lib/settings";
import { computeTotalRsd } from "@/lib/pricing";
import { generatePromoCode } from "@/lib/promo";

function int(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function POST(req: Request) {
  const form = await req.formData();

  const showId = String(form.get("showId") || "").trim();
  const fullName = String(form.get("fullName") || "").trim();
  const email = String(form.get("email") || "").trim();

  const regionId = String(form.get("regionId") || "").trim();
  const qty = int(form.get("qty")) ?? 1;

  const promoCodeTextRaw = String(form.get("promoCode") || "").trim();
  const promoCodeText = promoCodeTextRaw ? promoCodeTextRaw.toUpperCase() : null;

  if (!showId || !fullName || !email || !regionId) {
    return NextResponse.json({ ok: false, error: "Nedostaju podaci." }, { status: 400 });
  }
  if (qty < 1 || qty > 20) {
    return NextResponse.json({ ok: false, error: "Neispravna količina (1–20)." }, { status: 400 });
  }

  const price = await prisma.showPrice.findUnique({
    where: { showId_regionId: { showId, regionId } },
    include: { region: true, show: true },
  });

  if (!price) {
    return NextResponse.json({ ok: false, error: "Cena za region nije pronađena." }, { status: 404 });
  }

  try {
    await assertCapacityOrThrow({
      showId,
      regionId,
      requestedQty: qty,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Nema dovoljno mesta u izabranom regionu." },
      { status: 400 }
    );
  }

  const unitPriceRsd = price.priceRsd;
  const lineTotalRsd = unitPriceRsd * qty;

  let promoPct = 0;
  let promoIdToUse: string | null = null;

  if (promoCodeText) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCodeText },
      select: { id: true, status: true, discountPct: true },
    });

    if (!promo) {
      return NextResponse.json({ ok: false, error: "Promo kod ne postoji." }, { status: 400 });
    }
    if (promo.status !== "UNUSED") {
      return NextResponse.json({ ok: false, error: "Promo kod nije važeći (iskorišćen ili nevažeći)." }, { status: 400 });
    }

    promoPct = promo.discountPct ?? 5;
    promoIdToUse = promo.id;
  }

  const discountUntil = await getDiscountUntil();
  const pricing = computeTotalRsd({
    subtotalRsd: lineTotalRsd,
    discountUntil,
    promoPct: promoPct || undefined,
  });

  const accessCode = randomUUID();

  const reservation = await prisma.$transaction(async (tx) => {
    const created = await tx.reservation.create({
      data: {
        showId,
        fullName,
        email,
        accessCode,
        status: "ACTIVE",

        promoCodeUsed: promoCodeText, 

        totalRsd: pricing.totalRsd,
        currencyCode: "RSD",
        fxRateUsed: null,
        totalInCurrency: null,

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
      select: { id: true, accessCode: true },
    });

    if (promoIdToUse) {
      await tx.promoCode.update({
        where: { id: promoIdToUse },
        data: {
          status: "USED",
          usedAt: new Date(),
          usedByReservationId: created.id,
        },
      });
    }

    const newCode = generatePromoCode();
    await tx.promoCode.create({
      data: {
        code: newCode,
        status: "UNUSED",
        discountPct: 5,
        issuedByReservationId: created.id,
      },
    });

    return created;
  });

  return NextResponse.redirect(new URL(`/reservation-success/${reservation.accessCode}`, req.url));
}
