"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import type { RegistroHoras } from "@/interfaces/registro-horas.interface";
import {
  STATUS_REGISTRO_HORAS_LABELS,
  STATUS_REGISTRO_HORAS_COLORS,
} from "@/interfaces/registro-horas.interface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/formatters";
import { Clock, User, Check, X, AlertCircle } from "lucide-react";

interface RegistroHoraItemProps {
  registro: RegistroHoras;
  colaboradorNome: string;
  aprovadorNome?: string;
  isLider: boolean;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string, motivo: string) => void;
}

export const RegistroHoraItem = ({
  registro,
  colaboradorNome,
  aprovadorNome,
  isLider,
  onAprovar,
  onRejeitar,
}: RegistroHoraItemProps) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const handleRejeitar = () => {
    if (motivoRejeicao.trim()) {
      onRejeitar(registro.id, motivoRejeicao.trim());
      setShowRejectForm(false);
      setMotivoRejeicao("");
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        "bg-slate-800/50 border-slate-700/50",
        registro.status === "pendente" && "border-l-4 border-l-yellow-500",
        registro.status === "aprovado" && "border-l-4 border-l-green-500",
        registro.status === "rejeitado" && "border-l-4 border-l-red-500"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <span className="text-lg font-semibold text-slate-100">{registro.horas}h</span>
          </div>
          <Badge className={STATUS_REGISTRO_HORAS_COLORS[registro.status]}>
            {STATUS_REGISTRO_HORAS_LABELS[registro.status]}
          </Badge>
        </div>
        <span className="text-sm text-slate-500">{formatDate(registro.data)}</span>
      </div>

      {/* Info do colaborador */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
        <User className="h-4 w-4" />
        <span>{colaboradorNome}</span>
      </div>

      {/* Descrição */}
      <p className="text-sm text-slate-300 mb-3">{registro.descricao}</p>

      {/* Info de aprovação/rejeição */}
      {registro.status === "aprovado" && aprovadorNome && (
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Check className="h-3 w-3 text-green-400" />
          Aprovado por {aprovadorNome} em {formatDate(registro.dataAprovacao!)}
        </div>
      )}

      {registro.status === "rejeitado" && (
        <div className="text-xs text-slate-500">
          <div className="flex items-center gap-1 text-red-400">
            <X className="h-3 w-3" />
            Rejeitado por {aprovadorNome} em {formatDate(registro.dataAprovacao!)}
          </div>
          {registro.motivoRejeicao && (
            <div className="mt-1 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Motivo: {registro.motivoRejeicao}</span>
            </div>
          )}
        </div>
      )}

      {/* Ações de aprovação (apenas para líder e registros pendentes) */}
      {isLider && registro.status === "pendente" && !showRejectForm && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <Button
            size="sm"
            onClick={() => onAprovar(registro.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowRejectForm(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <X className="h-4 w-4 mr-1" />
            Rejeitar
          </Button>
        </div>
      )}

      {/* Formulário de rejeição */}
      {showRejectForm && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
          <textarea
            value={motivoRejeicao}
            onChange={(e) => setMotivoRejeicao(e.target.value)}
            placeholder="Motivo da rejeição..."
            rows={2}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-slate-900 border border-slate-600",
              "text-slate-100 placeholder-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-red-500"
            )}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowRejectForm(false);
                setMotivoRejeicao("");
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleRejeitar}
              disabled={!motivoRejeicao.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Rejeição
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
