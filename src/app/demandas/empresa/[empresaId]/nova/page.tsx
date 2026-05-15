"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { FormInovacao } from "@/components/FormularioDemanda/FormInovacao";
import { FormOperacional } from "@/components/FormularioDemanda/FormOperacional";
import { FormEstrategico } from "@/components/FormularioDemanda/FormEstrategico";
import { useEmpresaStore } from "@/stores/empresa.store";
import { usePermissoes } from "@/hooks/usePermissoes";
import {
  FORMULARIO_TIPO_LABELS,
  type FormularioTipo,
} from "@/interfaces/empresa.interface";
import { ArrowLeft, ShieldAlert, Building2 } from "lucide-react";

const NovaDemandaEmpresaPage = () => {
  const params = useParams();
  const empresaId = params.empresaId as string;

  const { getById: getEmpresa } = useEmpresaStore();
  const { podeExecutarAcao } = usePermissoes();

  const empresa = getEmpresa(empresaId);
  const podeCriar = podeExecutarAcao("demandas", "criar");

  if (!empresa) {
    return (
      <Layout title="Empresa não encontrada">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">Empresa não encontrada</p>
          <Link href="/demandas" className="mt-4">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!podeCriar) {
    return (
      <Layout title="Acesso negado">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert className="mb-4 h-12 w-12 text-red-500/60" />
          <p className="text-lg font-semibold text-slate-300">Sem permissão</p>
          <p className="mt-1 text-sm text-slate-500">
            Você não tem permissão para criar demandas.
          </p>
          <Link href={`/demandas/empresa/${empresaId}`} className="mt-4">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const tipo = (empresa.formularioTipo ?? "inovacao") as FormularioTipo;

  const subtitleMap: Record<FormularioTipo, string> = {
    inovacao: "Registre uma nova ideia de inovação",
    operacional: "Registre uma demanda de automação ou melhoria de processo",
    estrategico: "Registre uma nova iniciativa estratégica",
  };

  return (
    <Layout
      title={`Nova Demanda — ${empresa.nome}`}
      subtitle={subtitleMap[tipo]}
    >
      <div className="mb-6">
        <Link href={`/demandas/empresa/${empresaId}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar
          </Button>
        </Link>
      </div>
      {tipo === "inovacao" && (
        <FormInovacao
          empresaId={empresaId}
          empresaNome={empresa.nome}
          redirectTo={`/demandas/empresa/${empresaId}`}
        />
      )}
      {tipo === "operacional" && (
        <FormOperacional
          empresaId={empresaId}
          empresaNome={empresa.nome}
          redirectTo={`/demandas/empresa/${empresaId}`}
        />
      )}
      {tipo === "estrategico" && (
        <FormEstrategico
          empresaId={empresaId}
          empresaNome={empresa.nome}
          redirectTo={`/demandas/empresa/${empresaId}`}
        />
      )}
    </Layout>
  );
};

export default NovaDemandaEmpresaPage;
