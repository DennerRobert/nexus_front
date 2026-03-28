import type { NotificacaoTipo } from "@/interfaces/notificacao.interface";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  UserCheck,
  Zap,
  Flag,
  FolderKanban,
  Users,
  type LucideIcon,
} from "lucide-react";

interface NotificacaoConfig {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  label: string;
}

export const NOTIFICACAO_CONFIG: Record<NotificacaoTipo, NotificacaoConfig> = {
  demanda_criada: {
    icon: FileText,
    bgColor: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    label: "Demanda criada",
  },
  demanda_aprovada: {
    icon: CheckCircle,
    bgColor: "bg-green-500/15",
    iconColor: "text-green-400",
    label: "Demanda aprovada",
  },
  demanda_rejeitada: {
    icon: XCircle,
    bgColor: "bg-red-500/15",
    iconColor: "text-red-400",
    label: "Demanda rejeitada",
  },
  demanda_em_analise: {
    icon: Clock,
    bgColor: "bg-blue-500/15",
    iconColor: "text-blue-400",
    label: "Em análise",
  },
  demanda_ajustes: {
    icon: AlertCircle,
    bgColor: "bg-orange-500/15",
    iconColor: "text-orange-400",
    label: "Ajustes solicitados",
  },
  comentario_adicionado: {
    icon: MessageSquare,
    bgColor: "bg-slate-500/20",
    iconColor: "text-slate-400",
    label: "Novo comentário",
  },
  tarefa_atribuida: {
    icon: UserCheck,
    bgColor: "bg-violet-500/15",
    iconColor: "text-violet-400",
    label: "Tarefa atribuída",
  },
  sprint_iniciada: {
    icon: Zap,
    bgColor: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
    label: "Sprint iniciada",
  },
  marco_proximo: {
    icon: Flag,
    bgColor: "bg-orange-500/15",
    iconColor: "text-orange-400",
    label: "Marco próximo",
  },
  projeto_atualizado: {
    icon: FolderKanban,
    bgColor: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    label: "Projeto atualizado",
  },
  alocacao_criada: {
    icon: Users,
    bgColor: "bg-violet-500/15",
    iconColor: "text-violet-400",
    label: "Alocação criada",
  },
};

export const getNotificacaoConfig = (tipo: NotificacaoTipo): NotificacaoConfig =>
  NOTIFICACAO_CONFIG[tipo];
