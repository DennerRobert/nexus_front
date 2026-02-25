"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useAvaliacaoDemandaStore } from "@/stores/avaliacao-demanda.store";
import { CRITERIOS_AVALIACAO, TOTAL_PERGUNTAS } from "@/config/criterios-avaliacao.config";
import type { CriterioAvaliacao, PerguntaAvaliacao, PontuacaoTotal } from "@/interfaces/avaliacao-demanda.interface";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Save,
  Info,
} from "lucide-react";

interface CriteriosAvaliacaoFormProps {
  demandaId: string;
  avaliadorId: string;
  readOnly?: boolean;
  onComplete?: () => void;
  className?: string;
}

export const CriteriosAvaliacaoForm = ({
  demandaId,
  avaliadorId,
  readOnly = false,
  onComplete,
  className,
}: CriteriosAvaliacaoFormProps) => {
  const {
    getByDemanda,
    avaliar,
    calcularPontuacaoTotal,
    todasPerguntasRespondidas,
  } = useAvaliacaoDemandaStore();

  const [criterioExpandido, setCriterioExpandido] = useState<string | null>(
    CRITERIOS_AVALIACAO[0]?.id || null
  );
  const [respostasLocais, setRespostasLocais] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);

  // Carregar respostas existentes APENAS na montagem inicial
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const respostas = getByDemanda(demandaId);
    const respostasMap: Record<string, number> = {};
    respostas.forEach((r) => {
      respostasMap[r.perguntaId] = r.valor;
    });
    setRespostasLocais(respostasMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandaId]);

  // Calcular pontuação (sem respostasLocais como dependência para evitar loops)
  const pontuacao = useMemo(() => {
    return calcularPontuacaoTotal(demandaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandaId, respostasLocais]);

  // Verificar progresso por critério
  const progressoPorCriterio = useMemo(() => {
    const progresso: Record<string, { respondidas: number; total: number }> = {};
    CRITERIOS_AVALIACAO.forEach((criterio) => {
      const respondidas = criterio.perguntas.filter(
        (p) => respostasLocais[p.id] !== undefined
      ).length;
      progresso[criterio.id] = {
        respondidas,
        total: criterio.perguntas.length,
      };
    });
    return progresso;
  }, [respostasLocais]);

  const handleResponder = useCallback((pergunta: PerguntaAvaliacao, valor: number) => {
    if (readOnly) return;

    // Atualizar estado local primeiro
    setRespostasLocais((prev) => ({
      ...prev,
      [pergunta.id]: valor,
    }));

    // Salvar na store (sem causar re-renderização do componente)
    avaliar({
      demandaId,
      avaliadorId,
      perguntaId: pergunta.id,
      criterioId: pergunta.criterioId,
      valor,
    });
  }, [readOnly, demandaId, avaliadorId, avaliar]);

  // Handler para toggle de critério (estável)
  const handleToggleCriterio = useCallback((criterioId: string) => {
    setCriterioExpandido((prev) => prev === criterioId ? null : criterioId);
  }, []);

  const handleSalvarTudo = async () => {
    setIsSaving(true);

    // Todas as respostas já são salvas ao clicar, mas podemos forçar uma verificação
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSaving(false);
    toast.success("Avaliação salva com sucesso!");

    if (todasPerguntasRespondidas(demandaId)) {
      onComplete?.();
    }
  };

  const totalRespondidas = Object.keys(respostasLocais).length;
  const percentualConclusao = (totalRespondidas / TOTAL_PERGUNTAS) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Critérios de Avaliação
          </h3>
          <p className="text-sm text-slate-400">
            {totalRespondidas} de {TOTAL_PERGUNTAS} perguntas respondidas
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Barra de progresso */}
          <div className="w-32">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                style={{ width: `${percentualConclusao}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-center mt-1">
              {percentualConclusao.toFixed(0)}% completo
            </p>
          </div>
          {!readOnly && (
            <Button
              onClick={handleSalvarTudo}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar
            </Button>
          )}
        </div>
      </div>

      {/* Score resumido */}
      <ScoreResumo pontuacao={pontuacao} />

      {/* Lista de critérios */}
      <div className="space-y-4">
        {CRITERIOS_AVALIACAO.map((criterio) => (
          <CriterioCard
            key={criterio.id}
            criterio={criterio}
            isExpanded={criterioExpandido === criterio.id}
            onToggle={() => handleToggleCriterio(criterio.id)}
            progresso={progressoPorCriterio[criterio.id]}
            respostas={respostasLocais}
            onResponder={handleResponder}
            readOnly={readOnly}
            pontuacaoCriterio={
              pontuacao.porCriterio.find((c) => c.criterioId === criterio.id)
            }
          />
        ))}
      </div>
    </div>
  );
};

// Componente de score resumido
const ScoreResumo = ({ pontuacao }: { pontuacao: PontuacaoTotal }) => {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {pontuacao.pontuacaoPonderada.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400">Score Ponderado</p>
          </div>
          <div className="text-center border-x border-slate-700">
            <p className="text-2xl font-bold text-slate-200">
              {pontuacao.pontuacaoBruta.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400">Score Bruto (0-5)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {pontuacao.percentualConclusao.toFixed(0)}%
            </p>
            <p className="text-xs text-slate-400">Conclusão</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de card de critério
interface CriterioCardProps {
  criterio: CriterioAvaliacao;
  isExpanded: boolean;
  onToggle: () => void;
  progresso: { respondidas: number; total: number };
  respostas: Record<string, number>;
  onResponder: (pergunta: PerguntaAvaliacao, valor: number) => void;
  readOnly: boolean;
  pontuacaoCriterio?: {
    pontuacaoMedia: number;
    pontuacaoPonderada: number;
  };
}

const CriterioCard = ({
  criterio,
  isExpanded,
  onToggle,
  progresso,
  respostas,
  onResponder,
  readOnly,
  pontuacaoCriterio,
}: CriterioCardProps) => {
  const isCompleto = progresso.respondidas === progresso.total;

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCompleto ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Circle className="h-5 w-5 text-slate-500" />
            )}
            <div>
              <h4 className="font-medium text-slate-200">{criterio.nome}</h4>
              <p className="text-xs text-slate-500">
                Peso: {criterio.peso}% • {progresso.respondidas}/{progresso.total} perguntas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {pontuacaoCriterio && pontuacaoCriterio.pontuacaoMedia > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-cyan-400">
                  {pontuacaoCriterio.pontuacaoMedia.toFixed(1)}/5
                </p>
                <p className="text-xs text-slate-500">
                  +{pontuacaoCriterio.pontuacaoPonderada.toFixed(2)} pts
                </p>
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          {/* Descrição do critério */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50">
            <Info className="h-4 w-4 text-slate-400 mt-0.5" />
            <p className="text-sm text-slate-400">{criterio.descricao}</p>
          </div>

          {/* Perguntas */}
          {criterio.perguntas.map((pergunta, index) => (
            <PerguntaItem
              key={pergunta.id}
              pergunta={pergunta}
              numero={index + 1}
              valorSelecionado={respostas[pergunta.id]}
              onSelecionar={(valor) => onResponder(pergunta, valor)}
              readOnly={readOnly}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
};

// Componente de pergunta
interface PerguntaItemProps {
  pergunta: PerguntaAvaliacao;
  numero: number;
  valorSelecionado?: number;
  onSelecionar: (valor: number) => void;
  readOnly: boolean;
}

const PerguntaItem = ({
  pergunta,
  numero,
  valorSelecionado,
  onSelecionar,
  readOnly,
}: PerguntaItemProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-200">
        <span className="text-slate-500 mr-2">{numero}.</span>
        {pergunta.texto}
      </p>
      <div className="space-y-2">
        {pergunta.opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            onClick={() => !readOnly && onSelecionar(opcao.valor)}
            disabled={readOnly}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left",
              valorSelecionado === opcao.valor
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-700 hover:border-slate-600 bg-slate-800/30",
              readOnly && "cursor-default"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                valorSelecionado === opcao.valor
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-700 text-slate-400"
              )}
            >
              {opcao.valor}
            </div>
            <p
              className={cn(
                "text-sm",
                valorSelecionado === opcao.valor
                  ? "text-slate-200"
                  : "text-slate-400"
              )}
            >
              {opcao.descricao}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
