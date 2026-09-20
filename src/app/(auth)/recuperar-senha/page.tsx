import { AuthCard } from "@/components/auth/auth-card";
import { resetPassword } from "@/features/auth/actions";
export default function Page() { return <AuthCard title="Recupere seu acesso" subtitle="Enviaremos um link seguro para redefinir sua senha." action={resetPassword} mode="reset" />; }
