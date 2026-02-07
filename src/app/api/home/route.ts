import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      events: {
        include: {
          shows: {
            orderBy: { startsAt: "asc" },
            include: {
              venue: true,
              prices: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    categories,
  });
}
