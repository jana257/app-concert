export function computeTotalRsd(opts: {
  subtotalRsd: number;
  discountUntil: Date | null;
  promoPct?: number; 
  now?: Date;
}) {
  const now = opts.now ?? new Date();

  let total = Math.round(opts.subtotalRsd);
  let discount10Applied = false;
  let promoApplied = false;

  if (opts.discountUntil && now <= opts.discountUntil) {
    total = Math.round(total * 0.9);
    discount10Applied = true;
  }

  if (opts.promoPct && opts.promoPct > 0) {
    total = Math.round(total * (1 - opts.promoPct / 100));
    promoApplied = true;
  }

  return { totalRsd: total, discount10Applied, promoApplied };
}
