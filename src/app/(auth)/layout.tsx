import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) { return <main className="auth-shell"><section className="auth-brand"><Link href="/"><Image src="/assets/mapa-facil-horizontal.png" alt="Mapa Fácil" width={190} height={62} /></Link><div><span>CLAREZA PARA EXECUTAR</span><h1>Quando você consegue ver o caminho, fica mais fácil avançar.</h1><p>Organize ideias e desenhe jornadas comerciais em um canvas que acompanha seu raciocínio.</p></div></section><section className="auth-content">{children}</section></main>; }
