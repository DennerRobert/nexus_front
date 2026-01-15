"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/utils/cn";
import type { Tarefa } from "@/interfaces/tarefa.interface";
import type { ComentarioTarefaFormData } from "@/interfaces/comentario-tarefa.interface";
import { comentarioTarefaFormSchema } from "@/schemas/comentario-tarefa.schema";
import { useComentarioTarefaStore } from "@/stores/comentario-tarefa.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/formatters";
import { Send, User, Edit2, Trash2, X, Check } from "lucide-react";

interface TabComentariosProps {
  tarefa: Tarefa;
  usuarioAtualId: string;
}

export const TabComentarios = ({ tarefa, usuarioAtualId }: TabComentariosProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { getByTarefa, create, update, remove } = useComentarioTarefaStore();
  const { getById: getColaborador } = useColaboradorStore();

  const comentarios = getByTarefa(tarefa.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComentarioTarefaFormData>({
    resolver: zodResolver(comentarioTarefaFormSchema),
    defaultValues: {
      conteudo: "",
    },
  });

  const handleAddComentario = (data: ComentarioTarefaFormData) => {
    create(tarefa.id, usuarioAtualId, data);
    reset();
  };

  const handleStartEdit = (comentarioId: string, conteudo: string) => {
    setEditingId(comentarioId);
    setEditContent(conteudo);
  };

  const handleSaveEdit = (comentarioId: string) => {
    if (editContent.trim()) {
      update(comentarioId, editContent.trim());
    }
    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = (comentarioId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
      remove(comentarioId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lista de comentários */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {comentarios.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Nenhum comentário ainda.</p>
            <p className="text-sm">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comentarios.map((comentario) => {
            const autor = getColaborador(comentario.autorId);
            const isOwner = comentario.autorId === usuarioAtualId;
            const isEditing = editingId === comentario.id;

            return (
              <div
                key={comentario.id}
                className={cn(
                  "p-4 rounded-lg border",
                  "bg-slate-800/50 border-slate-700/50"
                )}
              >
                {/* Header do comentário */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {autor?.nome || "Usuário desconhecido"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(comentario.createdAt)}
                        {comentario.updatedAt.getTime() !== comentario.createdAt.getTime() && (
                          <span className="ml-1">(editado)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Ações (apenas para o autor) */}
                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(comentario.id, comentario.conteudo)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label="Editar comentário"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comentario.id)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors"
                        aria-label="Excluir comentário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Conteúdo do comentário */}
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg",
                        "bg-slate-900 border border-slate-600",
                        "text-slate-100 placeholder-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label="Cancelar edição"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comentario.id)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-green-400 transition-colors"
                        aria-label="Salvar edição"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 whitespace-pre-wrap">{comentario.conteudo}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Formulário de novo comentário */}
      <form onSubmit={handleSubmit(handleAddComentario)} className="border-t border-slate-700/50 pt-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              {...register("conteudo")}
              placeholder="Adicione um comentário..."
              rows={2}
              className={cn(
                "w-full px-3 py-2 rounded-lg",
                "bg-slate-800 border border-slate-700",
                "text-slate-100 placeholder-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
                errors.conteudo && "border-red-500"
              )}
            />
            {errors.conteudo && (
              <p className="text-xs text-red-400 mt-1">{errors.conteudo.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
