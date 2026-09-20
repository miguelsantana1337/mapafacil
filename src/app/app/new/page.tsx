import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProject } from "@/features/projects/actions";
import { projectTemplates } from "@/features/editor/templates";
export default function NewProjectPage() { return <main className="simple-page narrow"><Link href="/app"><ArrowLeft size={17} />Voltar</Link><span className="eyebrow">NOVO PROJETO</span><h1>Dê forma ao próximo caminho.</h1><form action={createProject} className="new-project-form"><label>Nome do projeto<input name="name" required defaultValue="Minha jornada comercial" maxLength={160} /></label><fieldset><legend>Estrutura inicial</legend>{projectTemplates.map((template, index) => <label className="template-choice" key={template.id}><input type="radio" name="template" value={template.id} defaultChecked={index === 1} /><span><strong>{template.name}</strong><small>{template.description}</small></span></label>)}</fieldset><button type="submit">Criar projeto</button></form></main>; }
