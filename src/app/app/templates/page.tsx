import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { projectTemplates } from "@/features/editor/templates";
export default function TemplatesPage() { return <main className="simple-page"><Link href="/app"><ArrowLeft size={17} />Voltar</Link><span className="eyebrow">MODELOS</span><h1>Estruturas para começar rápido.</h1><p>Todo modelo é completamente editável depois da criação.</p><div className="template-grid">{projectTemplates.map((template) => <Link key={template.id} href={`/app/projects/demo?template=${template.id}`} className="template-card"><div className={`template-art template-art--${template.projectType}`} /><strong>{template.name}</strong><span>{template.description}</span></Link>)}</div></main>; }
