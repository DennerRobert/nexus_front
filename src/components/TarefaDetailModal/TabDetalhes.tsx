"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/utils/cn";
import type { Tarefa, TarefaFormData } from "@/interfaces/tarefa.interface";
import type { Sprint } from "@/interfaces/sprint.interface";
import {
  PRIORIDADE_TAREFA_LABELS,
  PRIORIDADE_TAREFA_COLORS,
  STATUS_TAREFA_LABELS,
} from "@/interfaces/tarefa.interface";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTarefaStore } from "@/stores/tarefa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useSprintStore } from "@/stores/sprint.store";
import { formatDate } from "@/utils/formatters";
import {
  User,
  Calendar,
  Clock,
  Tag,
  Edit2,
  Save,
  X,
  Target,
} from "lucide-react";

interface TabDetalhesProps {
  tarefa: Tarefa;
  onUpdate: (tarefa: Tarefa) => void;
}

const tarefaEditSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  responsavelId: z.string().optional(),
  sprintId: z.string().optional(),
  prioridade: z.enum(["baixa", "media", "alta", "urgente"]),
  estimativaHoras: z.number().min(0).optional(),
  dataLimite: z.string().optional(),
});

type TarefaEditForm = z.infer<typeof tarefaEditSchema>;

export const TabDetalhes = ({ tarefa, onUpdate }: TabDetalhesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { update } = useTarefaStore();
  const { getAll: getColaboradores } = useColaboradorStore();
  const { getByProjeto: getSprintsByProjeto } = useSprintStore();

  const colaboradores = getColaboradores();
  const sprints = getSprintsByProjeto(tarefa.projetoId);
  const colaboradorResponsavel = colaboradores.find(
    (c) => c.id === tarefa.responsavelId
  );
  const sprintAtual = sprints.find((s) => s.id === tarefa.sprintId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TarefaEditForm>({
    resolver: zodResolver(tarefaEditSchema),
    defaultValues: {
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || "",
      responsavelId: tarefa.responsavelId || "",
      sprintId: tarefa.sprintId || "",
      prioridade: tarefa.prioridade,
      estimativaHoras: tarefa.estimativaHoras,
      dataLimite: tarefa.dataLimite
        ? new Date(tarefa.dataLimite).toISOString().split("T")[0]
        : "",
    },
  });

  const handleSave = (data: TarefaEditForm) => {
    const updated = update(tarefa.id, {
      titulo: data.titulo,
      descricao: data.descricao,
      responsavelId: data.responsavelId || undefined,
      sprintId: data.sprintId || undefined,
      prioridade: data.prioridade,
      estimativaHoras: data.estimativaHoras,
      dataLimite: data.dataLimite ? new Date(data.dataLimite) : undefined,
    } as TarefaFormData);

    if (updated) {
      onUpdate(updated);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <Input
          label="Título"
          {...register("titulo")}
          error={errors.titulo?.message}
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Descrição
          </label>
          <textarea
            {...register("descricao")}
            rows={4}
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-slate-800 border border-slate-700",
              "text-slate-100 placeholder-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Responsável"
            {...register("responsavelId")}
            options={[
              { value: "", label: "Sem responsável" },
              ...colaboradores.map((c) => ({ value: c.id, label: c.nome })),
            ]}
          />

          <Select
            label="Sprint"
            {...register("sprintId")}
            options={[
              { value: "", label: "Backlog (sem sprint)" },
              ...sprints
                .filter((s) => s.status !== "concluida" && s.status !== "cancelada")
                .map((s) => ({ value: s.id, label: s.nome })),
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Prioridade"
            {...register("prioridade")}
            options={Object.entries(PRIORIDADE_TAREFA_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />

          <Input
            label="Estimativa (horas)"
            type="number"
            step="0.5"
            {...register("estimativaHoras", { valueAsNumber: true })}
          />

          <Input
            label="Data Limite"
            type="date"
            {...register("dataLimite")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com título e ação de editar */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-100">{tarefa.titulo}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={STATUS_TAREFA_LABELS[tarefa.status] === "Concluído" ? "bg-green-500" : "bg-slate-600"}>
              {STATUS_TAREFA_LABELS[tarefa.status]}
            </Badge>
            <Badge className={PRIORIDADE_TAREFA_COLORS[tarefa.prioridade]}>
              {PRIORIDADE_TAREFA_LABELS[tarefa.prioridade]}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </div>

      {/* Descrição */}
      {tarefa.descricao && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Descrição</h4>
          <p className="text-slate-300 whitespace-pre-wrap">{tarefa.descricao}</p>
        </div>
      )}

      {/* Metadados */}
      <div className="grid grid-cols-2 gap-4">
        {/* Responsável */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-slate-700">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Responsável</p>
            <p className="text-sm text-slate-200">
              {colaboradorResponsavel?.nome || "Não atribuído"}
            </p>
          </div>
        </div>

        {/* Sprint */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-slate-700">
            <Target className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Sprint</p>
            <p className="text-sm text-slate-200">
              {sprintAtual?.nome || "Backlog"}
            </p>
          </div>
        </div>

        {/* Horas */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Horas</p>
            <p className="text-sm text-slate-200">
              {tarefa.horasRealizadas || 0}h / {tarefa.estimativaHoras || "?"}h
            </p>
          </div>
        </div>

        {/* Data limite */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="p-2 rounded-lg bg-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Data Limite</p>
            <p className={cn(
              "text-sm",
              tarefa.dataLimite && new Date(tarefa.dataLimite) < new Date() && tarefa.status !== "concluido"
                ? "text-red-400"
                : "text-slate-200"
            )}>
              {tarefa.dataLimite ? formatDate(tarefa.dataLimite) : "Não definida"}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {tarefa.tags && tarefa.tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {tarefa.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Datas de criação/atualização */}
      <div className="pt-4 border-t border-slate-700/50 text-xs text-slate-500">
        <p>Criada em: {formatDate(tarefa.createdAt)}</p>
        <p>Última atualização: {formatDate(tarefa.updatedAt)}</p>
      </div>
    </div>
  );
};
