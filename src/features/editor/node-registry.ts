import {
  BadgeDollarSign, Box, BriefcaseBusiness, Clock3, CreditCard,
  FormInput, GitBranch, Globe2, Mail, Megaphone, MessageCircle, MousePointerClick,
  PackageCheck, Presentation, RefreshCcw, ShoppingBag, Sparkles, StickyNote,
  Type, UsersRound, Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProjectNodeType, ProjectType } from "@/types/project";

export type NodeDefinition = {
  type: ProjectNodeType;
  label: string;
  description: string;
  category: string;
  color: string;
  icon: LucideIcon;
  projectTypes: ProjectType[];
  defaults?: Record<string, string | number | boolean>;
};

export const nodeRegistry: NodeDefinition[] = [
  { type: "root", label: "Ideia central", description: "Ponto inicial do mapa", category: "Mapa", color: "#0b68d7", icon: Sparkles, projectTypes: ["mindmap"] },
  { type: "topic", label: "Tópico", description: "Assunto principal", category: "Mapa", color: "#2563eb", icon: Box, projectTypes: ["mindmap"] },
  { type: "subtopic", label: "Subtópico", description: "Detalhe de um tópico", category: "Mapa", color: "#64748b", icon: GitBranch, projectTypes: ["mindmap"] },
  { type: "idea", label: "Ideia", description: "Insight ou possibilidade", category: "Mapa", color: "#8b5cf6", icon: Sparkles, projectTypes: ["mindmap"] },
  { type: "task", label: "Tarefa", description: "Ação a executar", category: "Mapa", color: "#0891b2", icon: PackageCheck, projectTypes: ["mindmap"] },
  { type: "decision", label: "Decisão", description: "Pergunta ou bifurcação", category: "Mapa", color: "#d97706", icon: GitBranch, projectTypes: ["mindmap"] },
  { type: "traffic", label: "Tráfego", description: "Origem de aquisição", category: "Aquisição", color: "#7c3aed", icon: Megaphone, projectTypes: ["funnel"], defaults: { canal: "Meta Ads", objetivo: "" } },
  { type: "creative", label: "Criativo", description: "Peça da campanha", category: "Aquisição", color: "#db2777", icon: Video, projectTypes: ["funnel"], defaults: { formato: "Imagem", url: "" } },
  { type: "landing_page", label: "Landing page", description: "Página de captura", category: "Páginas", color: "#2563eb", icon: Globe2, projectTypes: ["funnel"], defaults: { url: "", objetivo: "" } },
  { type: "sales_page", label: "Página de vendas", description: "Apresentação da oferta", category: "Páginas", color: "#1d4ed8", icon: MousePointerClick, projectTypes: ["funnel"], defaults: { url: "", oferta: "" } },
  { type: "form", label: "Formulário", description: "Coleta de informações", category: "Páginas", color: "#0284c7", icon: FormInput, projectTypes: ["funnel"], defaults: { ferramenta: "", destino: "" } },
  { type: "checkout", label: "Checkout", description: "Pagamento da oferta", category: "Páginas", color: "#059669", icon: CreditCard, projectTypes: ["funnel"], defaults: { plataforma: "", produto: "", preco: "" } },
  { type: "whatsapp", label: "WhatsApp", description: "Conversa ou automação", category: "Relacionamento", color: "#16a34a", icon: MessageCircle, projectTypes: ["funnel"], defaults: { mensagem: "", responsavel: "", cta: "" } },
  { type: "email", label: "E-mail", description: "Mensagem de relacionamento", category: "Relacionamento", color: "#0891b2", icon: Mail, projectTypes: ["funnel"], defaults: { assunto: "", mensagem: "", delay: "" } },
  { type: "crm", label: "CRM", description: "Etapa em ferramenta externa", category: "Comercial", color: "#475569", icon: BriefcaseBusiness, projectTypes: ["funnel"], defaults: { etapa: "", ferramenta: "", responsavel: "" } },
  { type: "meeting", label: "Reunião", description: "Conversa comercial", category: "Comercial", color: "#0f766e", icon: UsersRound, projectTypes: ["funnel"], defaults: { tipo: "", duracao: "", objetivo: "" } },
  { type: "proposal", label: "Proposta", description: "Apresentação comercial", category: "Comercial", color: "#c2410c", icon: Presentation, projectTypes: ["funnel"], defaults: { produto: "", valor: "", status: "" } },
  { type: "sale", label: "Venda", description: "Conversão desejada", category: "Comercial", color: "#15803d", icon: BadgeDollarSign, projectTypes: ["funnel"], defaults: { produto: "", valor: "", pagamento: "" } },
  { type: "upsell", label: "Upsell", description: "Oferta complementar superior", category: "Pós-venda", color: "#0f766e", icon: ShoppingBag, projectTypes: ["funnel"], defaults: { produto: "", valor: "", trigger: "" } },
  { type: "downsell", label: "Downsell", description: "Oferta alternativa", category: "Pós-venda", color: "#b45309", icon: ShoppingBag, projectTypes: ["funnel"], defaults: { produto: "", valor: "", trigger: "" } },
  { type: "remarketing", label: "Remarketing", description: "Retorno de audiência", category: "Pós-venda", color: "#9333ea", icon: RefreshCcw, projectTypes: ["funnel"], defaults: { canal: "", audiencia: "", janela: "" } },
  { type: "delay", label: "Espera", description: "Intervalo entre etapas", category: "Automação", color: "#64748b", icon: Clock3, projectTypes: ["funnel"], defaults: { quantidade: 24, unidade: "horas" } },
  { type: "condition", label: "Condição", description: "Ramificação SIM ou NÃO", category: "Automação", color: "#d97706", icon: GitBranch, projectTypes: ["funnel"], defaults: { pergunta: "Comprou?" } },
  { type: "custom", label: "Bloco personalizado", description: "Qualquer etapa da sua jornada", category: "Outros", color: "#0b68d7", icon: Box, projectTypes: ["funnel"] },
  { type: "note", label: "Nota", description: "Contexto livre", category: "Outros", color: "#eab308", icon: StickyNote, projectTypes: ["mindmap", "funnel"] },
  { type: "text", label: "Texto", description: "Título ou orientação", category: "Outros", color: "#64748b", icon: Type, projectTypes: ["mindmap", "funnel"] },
];

export const getNodeDefinition = (type: ProjectNodeType) =>
  nodeRegistry.find((item) => item.type === type) ?? nodeRegistry.at(-3)!;

export const getRegistryForProject = (projectType: ProjectType) =>
  nodeRegistry.filter((item) => item.projectTypes.includes(projectType));
