import { AuthCard } from "@/components/auth/auth-card";
import { signUp } from "@/features/auth/actions";
export default async function Page({ searchParams }: { searchParams: Promise<{ erro?: string }> }) { const query = await searchParams; return <AuthCard title="Crie seu espaço visual" subtitle="Comece com um mapa ou desenhe seu primeiro funil." action={signUp} mode="signup" error={query.erro} />; }
