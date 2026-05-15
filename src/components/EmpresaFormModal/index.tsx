"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useFormularioEmpresaStore } from "@/stores/formulario-empresa.store";
import type { Empresa, EmpresaFormData, FormularioTipo } from "@/interfaces/empresa.interface";
import {
  FORMULARIO_TIPO_LABELS,
  FORMULARIO_TIPO_DESCRICAO,
} from "@/interfaces/empresa.interface";
import type { CampoFormulario } from "@/interfaces/formulario-empresa.interface";
import { TIPO_CAMPO_LABELS } from "@/interfaces/formulario-empresa.interface";
import { cn } from "@/utils/cn";
import {
  Save,
  Lightbulb,
  Wrench,
  Target,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const FORMULARIO_TIPO_ICON: Record<FormularioTipo, typeof Lightbulb> = {
  inovacao: Lightbulb,
  operacional: Wrench,
  estrategico: Target,
};

const FORMULARIO_TIPO_COLOR: Record<FormularioTipo, string> = {
  inovacao: "text-cyan-400 border-cyan-500/50 bg-cyan-500/10",
  operacional: "text-amber-400 border-amber-500/50 bg-amber-500/10",
  estrategico: "text-violet-400 border-violet-500/50 bg-violet-500/10",
};

interface FormErrors {
  nome?: string;
  cnpj?: string;
  [campoId: string]: string | undefined;
}

// ─── Renderizador de campo customizado ───────────────────────────────────────

interface CampoRendererProps {
  campo: CampoFormulario;
  value: string;
  onChange: (valor: string) => void;
  error?: string;
}

const CampoRenderer = ({ campo, value, onChange, error }: CampoRendererProps) => {
  const baseInput = cn(
    "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
    "placeholder-slate-500 outline-none transition-all",
    "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
    error ? "border-red-500/50" : "border-slate-700"
  );

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {campo.label}
        {campo.obrigatorio && <span className="ml-1 text-red-400">*</span>}
        <span className="ml-2 text-xs font-normal text-slate-500">
          ({TIPO_CAMPO_LABELS[campo.tipo]})
        </span>
      </label>

      {campo.descricao && (
        <p className="mb-1.5 text-xs text-slate-500">{campo.descricao}</p>
      )}

      {campo.tipo === "texto" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || `Digite ${campo.label.toLowerCase()}...`}
          className={baseInput}
        />
      )}

      {campo.tipo === "textarea" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || `Digite ${campo.label.toLowerCase()}...`}
          rows={3}
          className={cn(baseInput, "resize-none")}
        />
      )}

      {campo.tipo === "numero" && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || "0"}
          className={baseInput}
        />
      )}

      {campo.tipo === "data" && (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseInput, "cursor-pointer")}
        />
      )}

      {campo.tipo === "selecao" && campo.opcoes && (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              baseInput,
              "appearance-none pr-10 cursor-pointer"
            )}
          >
            <option value="">Selecione uma opção...</option>
            {campo.opcoes.map((opcao) => (
              <option
                key={opcao}
                value={opcao}
                className="bg-slate-800 text-slate-100"
              >
                {opcao}
              </option>
            ))}
          </select>
        </div>
      )}

      {campo.tipo === "multipla_escolha" && campo.opcoes && (
        <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
          {campo.opcoes.map((opcao) => {
            const selecionadas = value ? value.split(",") : [];
            const marcada = selecionadas.includes(opcao);

            const handleToggle = () => {
              const novas = marcada
                ? selecionadas.filter((v) => v !== opcao)
                : [...selecionadas, opcao];
              onChange(novas.filter(Boolean).join(","));
            };

            return (
              <label
                key={opcao}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300 hover:text-slate-100"
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={handleToggle}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                {opcao}
              </label>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-red-400">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

// ─── EmpresaFormModal ─────────────────────────────────────────────────────────

interface EmpresaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa?: Empresa;
  onSalvar: (data: EmpresaFormData) => void;
}

export const EmpresaFormModal = ({
  isOpen,
  onClose,
  empresa,
  onSalvar,
}: EmpresaFormModalProps) => {
  const { getByEmpresa } = useFormularioEmpresaStore();

  const isEditing = !!empresa;

  // ─── Estado dos campos estáticos ─────────────────────────────────────────
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [setor, setSetor] = useState("");
  const [formularioTipo, setFormularioTipo] = useState<FormularioTipo | "">("");
  const [ativa, setAtiva] = useState(true);

  // ─── Estado dos campos dinâmicos ─────────────────────────────────────────
  const [dadosAdicionais, setDadosAdicionais] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Formulário configurado para esta empresa (somente no modo edição)
  const formulario = isEditing ? getByEmpresa(empresa.id) : undefined;
  const camposFormulario: CampoFormulario[] = formulario
    ? [...formulario.campos].sort((a, b) => a.ordem - b.ordem)
    : [];

  // Preencher estado ao abrir
  useEffect(() => {
    if (isOpen) {
      if (empresa) {
        setNome(empresa.nome);
        setCnpj(empresa.cnpj);
        setEmail(empresa.email ?? "");
        setTelefone(empresa.telefone ?? "");
        setDescricao(empresa.descricao ?? "");
        setSetor(empresa.setor ?? "");
        setFormularioTipo(empresa.formularioTipo ?? "");
        setAtiva(empresa.ativa);
        setDadosAdicionais(empresa.dadosAdicionais ?? {});
      } else {
        setNome("");
        setCnpj("");
        setEmail("");
        setTelefone("");
        setDescricao("");
        setSetor("");
        setFormularioTipo("");
        setAtiva(true);
        setDadosAdicionais({});
      }
      setErrors({});
    }
  }, [isOpen, empresa]);

  const handleDadoAdicionalChange = (campoId: string, valor: string) => {
    setDadosAdicionais((prev) => ({ ...prev, [campoId]: valor }));
    if (errors[campoId]) {
      setErrors((prev) => { const { [campoId]: _, ...rest } = prev; return rest; });
    }
  };

  const validar = (): boolean => {
    const novosErros: FormErrors = {};

    if (!nome.trim() || nome.trim().length < 2) {
      novosErros.nome = "O nome deve ter pelo menos 2 caracteres.";
    }

    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(cnpj)) {
      novosErros.cnpj = "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX).";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = "E-mail inválido.";
    }

    if (telefone && telefone.length > 20) {
      novosErros.telefone = "Telefone inválido.";
    }

    // Validar campos obrigatórios do formulário customizado
    camposFormulario.forEach((campo) => {
      if (campo.obrigatorio && !dadosAdicionais[campo.id]?.trim()) {
        novosErros[campo.id] = "Este campo é obrigatório.";
      }
    });

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) return;

    onSalvar({
      nome: nome.trim(),
      cnpj: cnpj.trim(),
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      descricao: descricao.trim() || undefined,
      setor: setor.trim() || undefined,
      formularioTipo: formularioTipo || undefined,
      ativa,
      dadosAdicionais:
        Object.keys(dadosAdicionais).length > 0 ? dadosAdicionais : undefined,
    });

    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Empresa" : "Nova Empresa"}
      description={
        isEditing
          ? "Atualize os dados e campos configurados para esta empresa."
          : "Preencha os dados para cadastrar uma nova empresa."
      }
      size="lg"
    >
      <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-1">

        {/* ─── Identificação ─────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Identificação
          </h3>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Nome da Empresa <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (errors.nome) setErrors((p) => ({ ...p, nome: undefined }));
              }}
              placeholder="Ex: Alpha Tecnologia"
              className={cn(
                "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
                "placeholder-slate-500 outline-none transition-all",
                "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
                errors.nome ? "border-red-500/50" : "border-slate-700"
              )}
            />
            {errors.nome && (
              <p className="mt-1.5 text-sm text-red-400">{errors.nome}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              CNPJ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => {
                setCnpj(e.target.value);
                if (errors.cnpj) setErrors((p) => ({ ...p, cnpj: undefined }));
              }}
              placeholder="00.000.000/0000-00"
              className={cn(
                "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
                "placeholder-slate-500 outline-none transition-all",
                "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
                errors.cnpj ? "border-red-500/50" : "border-slate-700"
              )}
            />
            {errors.cnpj && (
              <p className="mt-1.5 text-sm text-red-400">{errors.cnpj}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="contato@empresa.com.br"
                className={cn(
                  "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
                  "placeholder-slate-500 outline-none transition-all",
                  "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
                  errors.email ? "border-red-500/50" : "border-slate-700"
                )}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Telefone
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => {
                  setTelefone(e.target.value);
                  if (errors.telefone) setErrors((p) => ({ ...p, telefone: undefined }));
                }}
                placeholder="(11) 99999-9999"
                className={cn(
                  "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
                  "placeholder-slate-500 outline-none transition-all",
                  "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
                  errors.telefone ? "border-red-500/50" : "border-slate-700"
                )}
              />
              {errors.telefone && (
                <p className="mt-1.5 text-sm text-red-400">{errors.telefone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Setor
            </label>
            <input
              type="text"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              placeholder="Ex: Tecnologia da Informação, Pesquisa & Desenvolvimento..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição da empresa..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
        </section>

        {/* ─── Campos customizados (somente no modo edição) ──────────────── */}
        {isEditing && camposFormulario.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Campos do Formulário
              </h3>
              <Badge variant="secondary" className="text-xs">
                {camposFormulario.length}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Campos configurados na aba{" "}
              <span className="font-medium text-slate-400">Formulário</span>{" "}
              desta empresa.
            </p>
            <div className="space-y-4">
              {camposFormulario.map((campo) => (
                <CampoRenderer
                  key={campo.id}
                  campo={campo}
                  value={dadosAdicionais[campo.id] ?? ""}
                  onChange={(valor) => handleDadoAdicionalChange(campo.id, valor)}
                  error={errors[campo.id]}
                />
              ))}
            </div>
          </section>
        )}

        {isEditing && camposFormulario.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-700 px-4 py-3">
            <ClipboardList className="h-5 w-5 flex-shrink-0 text-slate-600" />
            <p className="text-sm text-slate-500">
              Nenhum campo configurado. Acesse a aba{" "}
              <span className="font-medium text-slate-400">Formulário</span>{" "}
              desta empresa para adicionar campos.
            </p>
          </div>
        )}

        {/* ─── Status ───────────────────────────────────────────────────── */}
        <section>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300 hover:text-slate-100">
            <input
              type="checkbox"
              checked={ativa}
              onChange={(e) => setAtiva(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            Empresa ativa
          </label>
        </section>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <div className="mt-6 flex justify-end gap-3 border-t border-slate-700/50 pt-5">
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSalvar} leftIcon={<Save className="h-4 w-4" />}>
          {isEditing ? "Salvar" : "Criar Empresa"}
        </Button>
      </div>
    </Modal>
  );
};
