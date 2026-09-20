import { AuthCard } from "@/components/auth/auth-card";
import { login } from "@/features/auth/actions";
export default async function Page({ searchParams }: { searchParams: Promise<{ erro?: string; mensagem?: string }> }) { const query = await searchParams; return <AuthCard title="Entre no seu espaço" subtitle="Continue organizando ideias e desenhando jornadas." action={login} mode="login" error={query.erro} message={query.mensagem} />; }
