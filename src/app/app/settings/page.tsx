import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function SettingsPage() { return <main className="simple-page narrow"><Link href="/app"><ArrowLeft size={17} />Voltar</Link><span className="eyebrow">CONFIGURAÇÕES</span><h1>Seu espaço</h1><section className="settings-card"><h2>Conta e sincronização</h2><p>A autenticação e os projetos são protegidos pelo Supabase. As opções pessoais serão exibidas aqui após o primeiro acesso.</p></section></main>; }
