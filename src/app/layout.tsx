import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Mapa Fácil", template: "%s — Mapa Fácil" }, description: "Transforme ideias, estratégias e funis em mapas visuais claros.", icons: { icon: "/assets/mapa-facil-icon.png" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}<Toaster position="bottom-center" richColors /></body></html>; }
