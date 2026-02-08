export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { setDiscountUntil } from "@/lib/settings";

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";

  let untilStr: string | null = null;

  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => null);
    untilStr = body?.until ?? null;
  } else {
    const form = await req.formData();
    untilStr = String(form.get("until") || "").trim() || null;
  }

  if (!untilStr) {
    await setDiscountUntil(null);
    return NextResponse.redirect(new URL("/admin/discount", req.url));
  }

  const d = new Date(untilStr);
  if (!Number.isFinite(d.getTime())) {
    return NextResponse.json({ ok: false, error: "Neispravan datum." }, { status: 400 });
  }

  await setDiscountUntil(d);
  return NextResponse.redirect(new URL("/admin/discount", req.url));
}
