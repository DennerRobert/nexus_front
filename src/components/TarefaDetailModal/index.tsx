"use client";

import type { Tarefa } from "@/interfaces/tarefa.interface";
import { Modal } from "@/components/ui/Modal";
import { Tabs, type Tab } from "@/components/Tabs";
import { TabDetalhes } from "./TabDetalhes";
import { TabComentarios } from "./TabComentarios";
import { TabHoras } from "./TabHoras";
import { FileText, MessageSquare, Clock } from "lucide-react";

interface TarefaDetailModalProps {
  tarefa: Tarefa | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (tarefa: Tarefa) => void;
  usuarioAtualId: string;
}

export const TarefaDetailModal = ({
  tarefa,
  isOpen,
  onClose,
  onUpdate,
  usuarioAtualId,
}: TarefaDetailModalProps) => {
  if (!tarefa) return null;

  const handleUpdate = (updated: Tarefa) => {
    onUpdate?.(updated);
  };

  const tabs: Tab[] = [
    {
      id: "detalhes",
      label: "Detalhes",
      icon: <FileText className="h-4 w-4" />,
      content: <TabDetalhes tarefa={tarefa} onUpdate={handleUpdate} />,
    },
    {
      id: "comentarios",
      label: "Comentários",
      icon: <MessageSquare className="h-4 w-4" />,
      content: <TabComentarios tarefa={tarefa} usuarioAtualId={usuarioAtualId} />,
    },
    {
      id: "horas",
      label: "Horas",
      icon: <Clock className="h-4 w-4" />,
      content: <TabHoras tarefa={tarefa} usuarioAtualId={usuarioAtualId} />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tarefa.titulo}
      size="lg"
    >
      <div className="min-h-[400px]">
        <Tabs tabs={tabs} defaultTab="detalhes" />
      </div>
    </Modal>
  );
};
