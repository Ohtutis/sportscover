"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LookupForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  return (
    <form className="lookup-form" onSubmit={(e) => { e.preventDefault(); const id = value.trim().toUpperCase().replace(/\s+/g, ""); if (id) router.push(`/c/${encodeURIComponent(id)}`); }}>
      <label>Card ID<input value={value} onChange={(e) => setValue(e.target.value)} placeholder="GDE-SN-BKB-2026-12" autoComplete="off" spellCheck={false} inputMode="text" /></label>
      <button className="button" type="submit">Find this edition</button>
    </form>
  );
}
