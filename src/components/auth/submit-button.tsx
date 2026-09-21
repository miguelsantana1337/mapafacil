"use client";
import { useFormStatus } from "react-dom";
export function SubmitButton({ label }: { label: string }) { const { pending } = useFormStatus(); return <button type="submit" disabled={pending} aria-busy={pending}>{pending ? "Aguarde…" : label}</button>; }
