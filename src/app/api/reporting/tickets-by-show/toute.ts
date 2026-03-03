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
            showId: true,
            show: {
              select: {
                startsAt: true,
                event: { select: { title: true, artist: true } },
                venue: { select: { name: true, city: true } },
              },
            },
          },
        },
      },
    });

    const map = new Map<
      string,
      {
        showId: string;
        eventTitle: string;
        artist: string;
        startsAt: string;
        venueName: string;
        venueCity: string;
        ticketsSold: number;
      }
    >();

    for (const it of items) {
      const showId = it.reservation.showId;
      const show = it.reservation.show;

      if (!map.has(showId)) {
        map.set(showId, {
          showId,
          eventTitle: show.event.title,
          artist: show.event.artist,
          startsAt: show.startsAt.toISOString(),
          venueName: show.venue.name,
          venueCity: show.venue.city,
          ticketsSold: 0,
        });
      }
      map.get(showId)!.ticketsSold += it.qty;
    }

    return NextResponse.json(
      Array.from(map.values()).sort((a, b) => b.ticketsSold - a.ticketsSold)
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Failed to generate report (tickets-by-show)." },
      { status: 500 }
    );
  }
}