import { prisma } from "@/lib/prisma";

export async function getDiscountUntil(): Promise<Date | null> {
  const row = await prisma.appSettings.findFirst({
    select: { discountUntil: true },
  });
  return row?.discountUntil ?? null;
}

export async function setDiscountUntil(date: Date | null) {
  const existing = await prisma.appSettings.findFirst({
    select: { id: true },
  });

  if (!existing) {
    await prisma.appSettings.create({
      data: { discountUntil: date },
    });
    return;
  }

  await prisma.appSettings.update({
    where: { id: existing.id },
    data: { discountUntil: date },
  });
}
