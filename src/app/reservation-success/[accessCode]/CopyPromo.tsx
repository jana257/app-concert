"use client";

import { useState } from "react";

type Props = {
  value: string;
  label?: string;
};

export default function CopyPromo({ value, label = "📋 Kopiraj" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={copy} style={{ marginTop: 8 }}>
      {copied ? "✅ Kopirano" : label}
    </button>
  );
}
