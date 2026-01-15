"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/utils/cn";
import type { Sprint, SprintFormData } from "@/interfaces/sprint.interface";
import { SPRINT_DURACAO_PADRAO } from "@/interfaces/sprint.interface";
import { sprintFormSchema } from "@/schemas/sprint.schema";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSprintStore } from "@/stores/sprint.store";
import { toast } from "sonner";
import { Target, Calendar, Save, Trash2 } from "lucide-react";

interface SprintModalProps {
  projetoId: string;
  sprint?: Sprint | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SprintModal = ({ projetoId, sprint, isOpen, onClose }: SprintModalProps) => {
  const { create, update, remove, getByProjeto } = useSprintStore();
  const isEditing = !!sprint;

  // Calcula próximo número de sprint e data sugerida
  const sprintsDoProjeto = getByProjeto(projetoId);
  const ultimaSprint = sprintsDoProjeto[sprintsDoProjeto.length - 1];
  const proximoNumero = sprintsDoProjeto.length + 1;

  const defaultDataInicio = ultimaSprint
    ? new Date(new Date(ultimaSprint.dataFim).getTime() + 24 * 60 * 60 * 1000)
    : new Date();

  const defaultDataFim = new Date(
    defaultDataInicio.getTime() + SPRINT_DURACAO_PADRAO * 24 * 60 * 60 * 1000
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      nome: sprint?.nome || `Sprint ${proximoNumero}`,
      objetivo: sprint?.objetivo || "",
      dataInicio: sprint?.dataInicio || defaultDataInicio,
      dataFim: sprint?.dataFim || defaultDataFim,
    },
  });

  // Reset form quando sprint mudar
  useEffect(() => {
    if (isOpen) {
      reset({
        nome: sprint?.nome || `Sprint ${proximoNumero}`,
        objetivo: sprint?.objetivo || "",
        dataInicio: sprint?.dataInicio || defaultDataInicio,
        dataFim: sprint?.dataFim || defaultDataFim,
      });
    }
  }, [isOpen, sprint, reset, proximoNumero]);

  const handleSave = (data: SprintFormData) => {
    if (isEditing && sprint) {
      update(sprint.id, data);
      toast.success("Sprint atualizada com sucesso!");
    } else {
      create(projetoId, data);
      toast.success("Sprint criada com sucesso!");
    }
    onClose();
  };

  const handleDelete = () => {
    if (sprint && window.confirm("Tem certeza que deseja excluir esta sprint?")) {
      const success = remove(sprint.id);
      if (success) {
        toast.success("Sprint excluída!");
        onClose();
      } else {
        toast.error("Não é possível excluir sprints ativas ou concluídas.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Sprint" : "Nova Sprint"}
      size="md"
    >
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        <div className="flex items-center gap-3 mb-4 text-slate-400">
          <Target className="h-5 w-5 text-cyan-400" />
          <span className="text-sm">
            {isEditing
              ? `Editando Sprint #${sprint?.numero}`
              : `Criando Sprint #${proximoNumero}`}
          </span>
        </div>

        <Input
          label="Nome da Sprint"
          placeholder="Ex: Sprint 1"
          {...register("nome")}
          error={errors.nome?.message}
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Objetivo da Sprint
          </label>
          <textarea
            {...register("objetivo")}
            rows={3}
            placeholder="Descreva o objetivo principal desta sprint..."
            className={cn(
              "w-full px-3 py-2 rounded-lg",
              "bg-slate-800 border border-slate-700",
              "text-slate-100 placeholder-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            )}
          />
          {errors.objetivo && (
            <p className="text-xs text-red-400 mt-1">{errors.objetivo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data de Início"
            type="date"
            {...register("dataInicio", {
              setValueAs: (v) => (v ? new Date(v) : new Date()),
            })}
            defaultValue={
              (sprint?.dataInicio || defaultDataInicio).toISOString().split("T")[0]
            }
            error={errors.dataInicio?.message}
          />

          <Input
            label="Data de Término"
            type="date"
            {...register("dataFim", {
              setValueAs: (v) => (v ? new Date(v) : new Date()),
            })}
            defaultValue={(sprint?.dataFim || defaultDataFim).toISOString().split("T")[0]}
            error={errors.dataFim?.message}
          />
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" />
          <span>Duração padrão: {SPRINT_DURACAO_PADRAO} dias</span>
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-700">
          {isEditing && sprint?.status === "planejamento" ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-1" />
              {isEditing ? "Salvar" : "Criar Sprint"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
