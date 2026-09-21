import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { projectTemplates } from "@/features/editor/templates";
import { TemplateCardForm } from "@/components/dashboard/template-card-form";
export default function TemplatesPage() { return <main className="simple-page"><Link href="/app"><ArrowLeft size={17} />Voltar</Link><span className="eyebrow">MODELOS</span><h1>Estruturas para começar rápido.</h1><p>Todo modelo cria um projeto real e continua completamente editável.</p><div className="template-grid">{projectTemplates.map((template) => <TemplateCardForm key={template.id} template={template} />)}</div></main>; }
