import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.reservationItem.findMany({
      where: {
        reservation: { status: "ACTIVE" },
      },
      select: {
        qty: true,
        reservation: {
          select: {
            show: {
              select: {
                venueId: true,
                venue: { select: { name: true, city: true, country: true } },
              },
            },
          },
        },
      },
    });

    const map = new Map<
      string,
      { venueId: string; venueName: string; city: string; country: string; ticketsSold: number }
    >();

    for (const it of items) {
      const venueId = it.reservation.show.venueId;
      const venue = it.reservation.show.venue;

      if (!map.has(venueId)) {
        map.set(venueId, {
          venueId,
          venueName: venue.name,
          city: venue.city,
          country: venue.country,
          ticketsSold: 0,
        });
      }
      map.get(venueId)!.ticketsSold += it.qty;
    }

    return NextResponse.json(
      Array.from(map.values()).sort((a, b) => b.ticketsSold - a.ticketsSold)
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Failed to generate report (tickets-by-location)." },
      { status: 500 }
    );
  }
}