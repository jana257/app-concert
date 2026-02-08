import { prisma } from "@/lib/prisma";

export async function assertCapacityOrThrow(opts: {
  showId: string;
  regionId: string;
  requestedQty: number;
  excludeReservationId?: string;
}) {
  const { showId, regionId, requestedQty, excludeReservationId } = opts;

  const region = await prisma.seatingRegion.findUnique({
    where: { id: regionId },
    select: { id: true, capacity: true },
  });

  if (!region) throw new Error("Region ne postoji.");

  const rows = await prisma.reservationItem.findMany({
    where: {
      regionId,
      reservation: {
        showId,
        status: "ACTIVE",
        ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      },
    },
    select: { qty: true },
  });

  const reserved = rows.reduce((sum, r) => sum + r.qty, 0);
  const remaining = region.capacity - reserved;

  if (requestedQty > remaining) {
    throw new Error(`Nema dovoljno mesta. Preostalo: ${remaining}.`);
  }

  return { reserved, remaining };
}
