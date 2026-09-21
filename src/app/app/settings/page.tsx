import Link from "next/link";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return <main className="simple-page narrow"><Link href="/app"><ArrowLeft size={17} />Voltar</Link><span className="eyebrow">CONFIGURAÇÕES</span><h1>Seu espaço</h1><section className="settings-card"><ShieldCheck size={24} /><h2>Conta e sincronização</h2><p>Seus mapas são salvos automaticamente e ficam associados à sua conta.</p><dl className="account-details"><div><dt>E-mail</dt><dd>{data.user?.email ?? "—"}</dd></div><div><dt>Status</dt><dd>{data.user?.email_confirmed_at ? "Conta confirmada" : "Confirmação pendente"}</dd></div></dl><form action={signOut}><button className="signout-button"><LogOut size={16} />Sair da conta</button></form></section></main>;
}
