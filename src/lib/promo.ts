export function generatePromoCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const len = 10;

  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 10)}`;
}
