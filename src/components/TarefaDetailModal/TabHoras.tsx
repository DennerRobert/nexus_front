"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/utils/cn";
import type { Tarefa } from "@/interfaces/tarefa.interface";
import type { RegistroHorasFormData } from "@/interfaces/registro-horas.interface";
import { registroHorasFormSchema } from "@/schemas/registro-horas.schema";
import { useRegistroHorasStore } from "@/stores/registro-horas.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useSquadStore } from "@/stores/squad.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RegistroHoraItem } from "./RegistroHoraItem";
import { Plus, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TabHorasProps {
  tarefa: Tarefa;
  usuarioAtualId: string;
}

export const TabHoras = ({ tarefa, usuarioAtualId }: TabHorasProps) => {
  const [showForm, setShowForm] = useState(false);

  const { getByTarefa, getTotalHorasAprovadas, create, aprovar, rejeitar } =
    useRegistroHorasStore();
  const { getById: getColaborador } = useColaboradorStore();
  const { getById: getSquad } = useSquadStore();
  const { getById: getProjeto } = useProjetoStore();

  const registros = getByTarefa(tarefa.id);
  const totalHorasAprovadas = getTotalHorasAprovadas(tarefa.id);
  const projeto = getProjeto(tarefa.projetoId);
  const squad = projeto?.squadId ? getSquad(projeto.squadId) : null;

  // Verifica se o usuário atual é líder do squad
  const isLider = squad?.liderTecnicoId === usuarioAtualId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistroHorasFormData>({
    resolver: zodResolver(registroHorasFormSchema),
    defaultValues: {
      horas: 1,
      data: new Date(),
      descricao: "",
    },
  });

  const handleAddRegistro = (data: RegistroHorasFormData) => {
    create(tarefa.id, usuarioAtualId, data);
    toast.success("Registro de horas adicionado! Aguardando aprovação.");
    reset();
    setShowForm(false);
  };

  const handleAprovar = (id: string) => {
    aprovar(id, usuarioAtualId);
    toast.success("Horas aprovadas com sucesso!");
  };

  const handleRejeitar = (id: string, motivo: string) => {
    rejeitar(id, usuarioAtualId, motivo);
    toast.error("Horas rejeitadas.");
  };

  // Calcula estatísticas
  const horasPendentes = registros
    .filter((r) => r.status === "pendente")
    .reduce((acc, r) => acc + r.horas, 0);

  const horasRejeitadas = registros
    .filter((r) => r.status === "rejeitado")
    .reduce((acc, r) => acc + r.horas, 0);

  return (
    <div className="space-y-4">
      {/* Resumo de horas */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">Estimativa</p>
          <p className="text-lg font-semibold text-slate-200">
            {tarefa.estimativaHoras || "-"}h
          </p>
        </div>
        <div className="p-3 rounded-lg bg-green-900/20 border border-green-700/50 text-center">
          <p className="text-xs text-green-400">Aprovadas</p>
          <p className="text-lg font-semibold text-green-300">{totalHorasAprovadas}h</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50 text-center">
          <p className="text-xs text-yellow-400">Pendentes</p>
          <p className="text-lg font-semibold text-yellow-300">{horasPendentes}h</p>
        </div>
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/50 text-center">
          <p className="text-xs text-red-400">Rejeitadas</p>
          <p className="text-lg font-semibold text-red-300">{horasRejeitadas}h</p>
        </div>
      </div>

      {/* Alerta se acima da estimativa */}
      {tarefa.estimativaHoras && totalHorasAprovadas > tarefa.estimativaHoras && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-900/20 border border-orange-700/50 text-orange-300 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Horas aprovadas ({totalHorasAprovadas}h) excedem a estimativa (
            {tarefa.estimativaHoras}h)
          </span>
        </div>
      )}

      {/* Botão de adicionar registro */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Horas
        </Button>
      )}

      {/* Formulário de registro */}
      {showForm && (
        <form
          onSubmit={handleSubmit(handleAddRegistro)}
          className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-4"
        >
          <h4 className="font-medium text-slate-200 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Novo Registro de Horas
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Horas"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              {...register("horas", { valueAsNumber: true })}
              error={errors.horas?.message}
            />
            <Input
              label="Data"
              type="date"
              {...register("data", {
                setValueAs: (v) => (v ? new Date(v) : new Date()),
              })}
              defaultValue={new Date().toISOString().split("T")[0]}
              error={errors.data?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Descrição do trabalho realizado
            </label>
            <textarea
              {...register("descricao")}
              rows={3}
              placeholder="Descreva o que foi feito neste período..."
              className={cn(
                "w-full px-3 py-2 rounded-lg",
                "bg-slate-900 border border-slate-700",
                "text-slate-100 placeholder-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
                errors.descricao && "border-red-500"
              )}
            />
            {errors.descricao && (
              <p className="text-xs text-red-400 mt-1">{errors.descricao.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setShowForm(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Registrar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de registros */}
      <div className="space-y-3">
        {registros.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum registro de horas ainda.</p>
          </div>
        ) : (
          registros.map((registro) => {
            const colaborador = getColaborador(registro.colaboradorId);
            const aprovador = registro.aprovadorId
              ? getColaborador(registro.aprovadorId)
              : null;

            return (
              <RegistroHoraItem
                key={registro.id}
                registro={registro}
                colaboradorNome={colaborador?.nome || "Desconhecido"}
                aprovadorNome={aprovador?.nome}
                isLider={isLider}
                onAprovar={handleAprovar}
                onRejeitar={handleRejeitar}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
