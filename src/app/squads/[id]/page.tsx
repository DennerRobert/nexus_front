"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useSquadStore } from "@/stores/squad.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { useAlocacaoStore } from "@/stores/alocacao.store";
import { useColaboradorStore } from "@/stores/colaborador.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import type { StatusSquad } from "@/interfaces/squad.interface";
import { STATUS_SQUAD_LABELS } from "@/interfaces/squad.interface";
import { PAPEL_ALOCACAO_LABELS, type PapelAlocacao } from "@/interfaces/alocacao.interface";
import { formatDate, formatCurrency, formatPercent } from "@/utils/formatters";
import {
  ArrowLeft,
  Plus,
  Users,
  Building2,
  DollarSign,
  PlayCircle,
  ArrowRightLeft,
  CheckCircle,
  Trash2,
} from "lucide-react";

const statusVariantMap: Record<StatusSquad, BadgeVariant> = {
  formando: "warning",
  ativo: "success",
  em_handover: "info",
  encerrado: "secondary",
};

interface SquadDetailPageProps {
  params: Promise<{ id: string }>;
}

const SquadDetailPage = ({ params }: SquadDetailPageProps) => {
  const { id } = use(params);

  const { getById, ativar, iniciarHandover, encerrar, atualizarCustoMensal } = useSquadStore();
  const { getById: getProjeto } = useProjetoStore();
  const { getAtivasBySquad, create: criarAlocacao, encerrar: encerrarAlocacao, calcularCustoSquad } = useAlocacaoStore();
  const { getComOcupacao, getById: getColaborador } = useColaboradorStore();
  const { getById: getEmpresa } = useEmpresaStore();

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState("");
  const [selectedPapel, setSelectedPapel] = useState<PapelAlocacao>("desenvolvedor");
  const [percentual, setPercentual] = useState(100);

  const squad = getById(id);
  const projeto = squad ? getProjeto(squad.projetoId) : null;
  const alocacoes = getAtivasBySquad(id);
  const colaboradoresDisponiveis = getComOcupacao().filter((c) => c.disponibilidade >= 20);

  const custoCalculado = useMemo(() => {
    return calcularCustoSquad(id);
  }, [id, calcularCustoSquad]);

  const composicaoPorEmpresa = useMemo(() => {
    const empresas: Record<string, { nome: string; count: number; custo: number }> = {};
    alocacoes.forEach((alocacao) => {
      const colaborador = getColaborador(alocacao.colaboradorId);
      if (colaborador) {
        const empresa = getEmpresa(colaborador.empresaId);
        const empresaId = colaborador.empresaId;
        if (!empresas[empresaId]) {
          empresas[empresaId] = { nome: empresa?.nome || "Desconhecida", count: 0, custo: 0 };
        }
        empresas[empresaId].count++;
        empresas[empresaId].custo += alocacao.custoMensal;
      }
    });
    return Object.values(empresas);
  }, [alocacoes, getColaborador, getEmpresa]);

  if (!squad) {
    return (
      <Layout title="Squad não encontrado">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-400">O squad solicitado não foi encontrado.</p>
          <Link href="/squads" className="mt-4">
            <Button variant="outline">Voltar para lista</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAtivar = () => {
    ativar(id);
    atualizarCustoMensal(id, custoCalculado);
    toast.success("Squad ativado!");
  };

  const handleIniciarHandover = () => {
    iniciarHandover(id);
    toast.success("Handover iniciado!");
  };

  const handleEncerrar = () => {
    encerrar(id);
    toast.success("Squad encerrado!");
  };

  const handleAddMember = () => {
    if (!selectedColaborador) {
      toast.error("Selecione um colaborador");
      return;
    }
    criarAlocacao({
      colaboradorId: selectedColaborador,
      squadId: id,
      papel: selectedPapel,
      percentual,
      dataInicio: new Date(),
    });
    atualizarCustoMensal(id, calcularCustoSquad(id));
    setShowAddMemberModal(false);
    setSelectedColaborador("");
    toast.success("Membro adicionado ao squad!");
  };

  const handleRemoveMember = (alocacaoId: string) => {
    encerrarAlocacao(alocacaoId);
    atualizarCustoMensal(id, calcularCustoSquad(id));
    toast.success("Membro removido do squad");
  };

  const canActivate = squad.status === "formando" && alocacoes.length > 0;
  const canHandover = squad.status === "ativo";
  const canClose = squad.status === "em_handover";

  return (
    <Layout
      title={squad.nome}
      subtitle={squad.objetivo}
      actions={
        <Link href="/squads">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membros do Squad
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariantMap[squad.status]}>
                    {STATUS_SQUAD_LABELS[squad.status]}
                  </Badge>
                  {(squad.status === "formando" || squad.status === "ativo") && (
                    <Button
                      size="sm"
                      onClick={() => setShowAddMemberModal(true)}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Adicionar
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>
                {alocacoes.length} membro(s) alocado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alocacoes.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-600" />
                  <p className="mt-2 text-slate-400">Nenhum membro alocado</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    Adicionar primeiro membro
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {alocacoes.map((alocacao) => {
                    const colaborador = getColaborador(alocacao.colaboradorId);
                    const empresa = colaborador ? getEmpresa(colaborador.empresaId) : null;
                    return (
                      <div
                        key={alocacao.id}
                        className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
                            <span className="text-sm font-medium text-slate-300">
                              {colaborador?.nome.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-100">
                              {colaborador?.nome || "N/A"}
                            </p>
                            <p className="text-sm text-slate-400">
                              {PAPEL_ALOCACAO_LABELS[alocacao.papel]}
                            </p>
                            <p className="text-xs text-slate-500">{empresa?.nome}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-cyan-400">
                              {formatPercent(alocacao.percentual)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(alocacao.custoMensal)}/mês
                            </p>
                          </div>
                          {squad.status !== "encerrado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(alocacao.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {composicaoPorEmpresa.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Composição por Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {composicaoPorEmpresa.map((emp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{emp.nome}</p>
                        <p className="text-sm text-slate-400">
                          {emp.count} profissional(is)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-100">
                          {formatCurrency(emp.custo)}
                        </p>
                        <p className="text-xs text-slate-500">custo/mês</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ações do Squad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {canActivate && (
                  <Button onClick={handleAtivar} leftIcon={<PlayCircle className="h-4 w-4" />}>
                    Ativar Squad
                  </Button>
                )}
                {canHandover && (
                  <Button
                    variant="outline"
                    onClick={handleIniciarHandover}
                    leftIcon={<ArrowRightLeft className="h-4 w-4" />}
                  >
                    Iniciar Handover
                  </Button>
                )}
                {canClose && (
                  <Button onClick={handleEncerrar} leftIcon={<CheckCircle className="h-4 w-4" />}>
                    Encerrar Squad
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custo do Squad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-cyan-400">
                {formatCurrency(custoCalculado)}
              </p>
              <p className="text-sm text-slate-400">por mês</p>
            </CardContent>
          </Card>

          {projeto && (
            <Card>
              <CardHeader>
                <CardTitle>Projeto Vinculado</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/projetos/${projeto.id}`}
                  className="block rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 transition-colors hover:bg-slate-800"
                >
                  <p className="font-medium text-slate-100">{projeto.nome}</p>
                  <p className="text-sm text-slate-400">
                    Orçamento: {formatCurrency(projeto.orcamento)}
                  </p>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-400">Início</dt>
                  <dd className="font-medium text-slate-100">
                    {formatDate(squad.dataInicio)}
                  </dd>
                </div>
                {squad.dataFim && (
                  <div>
                    <dt className="text-sm text-slate-400">Fim</dt>
                    <dd className="font-medium text-slate-100">
                      {formatDate(squad.dataFim)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Adicionar Membro"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Colaborador"
            placeholder="Selecione um colaborador"
            value={selectedColaborador}
            onChange={(e) => setSelectedColaborador(e.target.value)}
            options={colaboradoresDisponiveis.map((c) => ({
              value: c.id,
              label: `${c.nome} (${formatPercent(c.disponibilidade)} disponível)`,
            }))}
          />
          <Select
            label="Papel no Squad"
            value={selectedPapel}
            onChange={(e) => setSelectedPapel(e.target.value as PapelAlocacao)}
            options={Object.entries(PAPEL_ALOCACAO_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Input
            label="Percentual de Dedicação"
            type="number"
            min={10}
            max={100}
            value={percentual}
            onChange={(e) => setPercentual(Number(e.target.value))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMember}>Adicionar</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default SquadDetailPage;
