"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useFormularioEmpresaStore } from "@/stores/formulario-empresa.store";
import type {
  CampoFormulario,
  FormularioEmpresaFormData,
  CampoFormularioFormData,
  TipoCampoFormulario,
} from "@/interfaces/formulario-empresa.interface";
import { TIPO_CAMPO_LABELS } from "@/interfaces/formulario-empresa.interface";
import { cn } from "@/utils/cn";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  FileText,
  Type,
  AlignLeft,
  Hash,
  CalendarDays,
  ChevronDown,
  CheckSquare,
  X,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const TIPO_CAMPO_ICON: Record<TipoCampoFormulario, typeof Type> = {
  texto: Type,
  textarea: AlignLeft,
  numero: Hash,
  data: CalendarDays,
  selecao: ChevronDown,
  multipla_escolha: CheckSquare,
};

const TIPO_CAMPO_COLOR: Record<TipoCampoFormulario, string> = {
  texto: "text-blue-400 bg-blue-500/15",
  textarea: "text-purple-400 bg-purple-500/15",
  numero: "text-cyan-400 bg-cyan-500/15",
  data: "text-amber-400 bg-amber-500/15",
  selecao: "text-emerald-400 bg-emerald-500/15",
  multipla_escolha: "text-rose-400 bg-rose-500/15",
};

// ─── Formulário Modal ────────────────────────────────────────────────────────

interface FormularioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (data: FormularioEmpresaFormData) => void;
  initialData?: FormularioEmpresaFormData;
}

const FormularioModal = ({
  isOpen,
  onClose,
  onSalvar,
  initialData,
}: FormularioModalProps) => {
  const [titulo, setTitulo] = useState(initialData?.titulo ?? "");
  const [descricao, setDescricao] = useState(initialData?.descricao ?? "");
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);
  const [erro, setErro] = useState("");

  const isEditing = !!initialData;

  const handleSalvar = () => {
    if (!titulo.trim()) {
      setErro("O título é obrigatório.");
      return;
    }
    onSalvar({ titulo: titulo.trim(), descricao: descricao.trim() || undefined, ativo });
    onClose();
  };

  const handleClose = () => {
    setErro("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Formulário" : "Novo Formulário"}
      description="Configure as informações gerais do formulário desta empresa."
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              setErro("");
            }}
            placeholder="Ex: Formulário de Inovação Q1 2026"
            className={cn(
              "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
              "placeholder-slate-500 outline-none transition-all",
              "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
              erro ? "border-red-500/50" : "border-slate-700"
            )}
          />
          {erro && <p className="mt-1.5 text-sm text-red-400">{erro}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Descrição
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o objetivo deste formulário..."
            rows={3}
            className={cn(
              "w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
              "placeholder-slate-500 outline-none transition-all resize-none",
              "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAtivo((v) => !v)}
            aria-label={ativo ? "Desativar formulário" : "Ativar formulário"}
            className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-slate-100"
          >
            {ativo ? (
              <ToggleRight className="h-5 w-5 text-cyan-400" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-slate-500" />
            )}
            {ativo ? "Formulário ativo" : "Formulário inativo"}
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} leftIcon={<FileText className="h-4 w-4" />}>
            {isEditing ? "Salvar" : "Criar Formulário"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Campo Modal ─────────────────────────────────────────────────────────────

interface CampoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (data: CampoFormularioFormData) => void;
  initialData?: CampoFormularioFormData;
}

const TIPO_OPCOES: TipoCampoFormulario[] = [
  "texto",
  "textarea",
  "numero",
  "data",
  "selecao",
  "multipla_escolha",
];

const CampoModal = ({
  isOpen,
  onClose,
  onSalvar,
  initialData,
}: CampoModalProps) => {
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [tipo, setTipo] = useState<TipoCampoFormulario>(
    initialData?.tipo ?? "texto"
  );
  const [obrigatorio, setObrigatorio] = useState(
    initialData?.obrigatorio ?? false
  );
  const [placeholder, setPlaceholder] = useState(
    initialData?.placeholder ?? ""
  );
  const [descricao, setDescricao] = useState(initialData?.descricao ?? "");
  const [opcoes, setOpcoes] = useState<string[]>(initialData?.opcoes ?? []);
  const [novaOpcao, setNovaOpcao] = useState("");
  const [erroLabel, setErroLabel] = useState("");
  const [erroOpcoes, setErroOpcoes] = useState("");

  const isEditing = !!initialData;
  const precisaOpcoes = tipo === "selecao" || tipo === "multipla_escolha";

  const handleAdicionarOpcao = () => {
    const valor = novaOpcao.trim();
    if (!valor) return;
    if (opcoes.includes(valor)) {
      setErroOpcoes("Esta opção já foi adicionada.");
      return;
    }
    setOpcoes((prev) => [...prev, valor]);
    setNovaOpcao("");
    setErroOpcoes("");
  };

  const handleRemoverOpcao = (opcao: string) => {
    setOpcoes((prev) => prev.filter((o) => o !== opcao));
  };

  const handleSalvar = () => {
    if (!label.trim()) {
      setErroLabel("O rótulo do campo é obrigatório.");
      return;
    }
    if (precisaOpcoes && opcoes.length < 2) {
      setErroOpcoes("Adicione ao menos 2 opções.");
      return;
    }
    onSalvar({
      label: label.trim(),
      tipo,
      obrigatorio,
      placeholder: placeholder.trim() || undefined,
      descricao: descricao.trim() || undefined,
      opcoes: precisaOpcoes ? opcoes : undefined,
    });
    onClose();
  };

  const handleClose = () => {
    setErroLabel("");
    setErroOpcoes("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Editar Campo" : "Novo Campo"}
      description="Configure as propriedades deste campo do formulário."
      size="lg"
    >
      <div className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Tipo do Campo
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TIPO_OPCOES.map((t) => {
              const Icon = TIPO_CAMPO_ICON[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  aria-label={TIPO_CAMPO_LABELS[t]}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs transition-all",
                    tipo === t
                      ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-center leading-tight">
                    {TIPO_CAMPO_LABELS[t]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Rótulo <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setErroLabel("");
            }}
            placeholder="Ex: Nome completo, Descrição do problema..."
            className={cn(
              "w-full rounded-lg border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100",
              "placeholder-slate-500 outline-none transition-all",
              "focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30",
              erroLabel ? "border-red-500/50" : "border-slate-700"
            )}
          />
          {erroLabel && (
            <p className="mt-1.5 text-sm text-red-400">{erroLabel}</p>
          )}
        </div>

        {/* Placeholder (apenas para texto/textarea/numero) */}
        {(tipo === "texto" || tipo === "textarea" || tipo === "numero") && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Placeholder
            </label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Texto de exemplo para o campo..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
        )}

        {/* Opções (selecao / multipla_escolha) */}
        {precisaOpcoes && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Opções <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaOpcao}
                  onChange={(e) => {
                    setNovaOpcao(e.target.value);
                    setErroOpcoes("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdicionarOpcao();
                    }
                  }}
                  placeholder="Digite uma opção e pressione Enter"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAdicionarOpcao}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Adicionar
                </Button>
              </div>
              {erroOpcoes && (
                <p className="text-sm text-red-400">{erroOpcoes}</p>
              )}
              {opcoes.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 p-2">
                  {opcoes.map((opcao) => (
                    <span
                      key={opcao}
                      className="flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-700 px-2.5 py-1 text-xs text-slate-200"
                    >
                      {opcao}
                      <button
                        type="button"
                        onClick={() => handleRemoverOpcao(opcao)}
                        aria-label={`Remover opção ${opcao}`}
                        className="text-slate-400 transition-colors hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Descrição/dica */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Texto de ajuda
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Instrução opcional exibida abaixo do campo..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        {/* Obrigatório */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setObrigatorio((v) => !v)}
            aria-label={obrigatorio ? "Tornar opcional" : "Tornar obrigatório"}
            className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-slate-100"
          >
            {obrigatorio ? (
              <ToggleRight className="h-5 w-5 text-cyan-400" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-slate-500" />
            )}
            Campo obrigatório
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} leftIcon={<Plus className="h-4 w-4" />}>
            {isEditing ? "Salvar" : "Adicionar Campo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  titulo: string;
  descricao: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ConfirmModal = ({
  isOpen,
  titulo,
  descricao,
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) => (
  <Modal isOpen={isOpen} onClose={onCancelar} title={titulo} size="sm">
    <div className="space-y-4">
      <p className="text-sm text-slate-400">{descricao}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirmar}>
          Excluir
        </Button>
      </div>
    </div>
  </Modal>
);

// ─── Campo List Item ──────────────────────────────────────────────────────────

interface CampoListItemProps {
  campo: CampoFormulario;
  index: number;
  onEditar: (campo: CampoFormulario) => void;
  onExcluir: (campo: CampoFormulario) => void;
}

const CampoListItem = ({
  campo,
  index,
  onEditar,
  onExcluir,
}: CampoListItemProps) => {
  const Icon = TIPO_CAMPO_ICON[campo.tipo];
  const iconColor = TIPO_CAMPO_COLOR[campo.tipo];

  return (
    <Draggable draggableId={campo.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
            snapshot.isDragging
              ? "border-cyan-500/60 bg-slate-700 shadow-lg"
              : "border-slate-700/50 bg-slate-800/50"
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing"
            aria-label="Arrastar campo"
          >
            <GripVertical className="h-4 w-4 text-slate-500" />
          </div>

          <div
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
              iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-100">
                {campo.label}
              </span>
              {campo.obrigatorio && (
                <span className="text-xs text-red-400">*obrigatório</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {TIPO_CAMPO_LABELS[campo.tipo]}
              </span>
              {campo.opcoes && campo.opcoes.length > 0 && (
                <span className="text-xs text-slate-600">
                  · {campo.opcoes.length} opções
                </span>
              )}
              {campo.descricao && (
                <span className="max-w-xs truncate text-xs text-slate-600">
                  · {campo.descricao}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditar(campo)}
              aria-label={`Editar campo ${campo.label}`}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onExcluir(campo)}
              aria-label={`Excluir campo ${campo.label}`}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// ─── FormularioEmpresaTab (componente principal) ──────────────────────────────

interface FormularioEmpresaTabProps {
  empresaId: string;
}

type ModalAberto =
  | "criar-form"
  | "editar-form"
  | "excluir-form"
  | "criar-campo"
  | "editar-campo"
  | "excluir-campo"
  | null;

export const FormularioEmpresaTab = ({
  empresaId,
}: FormularioEmpresaTabProps) => {
  const {
    getByEmpresa,
    create,
    update,
    remove,
    addCampo,
    updateCampo,
    removeCampo,
    reorderCampos,
  } = useFormularioEmpresaStore();

  const [modalAberto, setModalAberto] = useState<ModalAberto>(null);
  const [campoEditando, setCampoEditando] = useState<CampoFormulario | null>(
    null
  );
  const [campoExcluindo, setCampoExcluindo] = useState<CampoFormulario | null>(
    null
  );

  const formulario = getByEmpresa(empresaId);
  const camposOrdenados = formulario
    ? [...formulario.campos].sort((a, b) => a.ordem - b.ordem)
    : [];

  const fecharModal = () => {
    setModalAberto(null);
    setCampoEditando(null);
    setCampoExcluindo(null);
  };

  const handleCriarFormulario = (data: FormularioEmpresaFormData) => {
    create(empresaId, data);
    toast.success("Formulário criado com sucesso!");
  };

  const handleEditarFormulario = (data: FormularioEmpresaFormData) => {
    if (!formulario) return;
    update(formulario.id, data);
    toast.success("Formulário atualizado!");
  };

  const handleExcluirFormulario = () => {
    if (!formulario) return;
    remove(formulario.id);
    fecharModal();
    toast.success("Formulário excluído.");
  };

  const handleCriarCampo = (data: CampoFormularioFormData) => {
    if (!formulario) return;
    addCampo(formulario.id, data);
    toast.success("Campo adicionado!");
  };

  const handleEditarCampo = (data: CampoFormularioFormData) => {
    if (!formulario || !campoEditando) return;
    updateCampo(formulario.id, campoEditando.id, data);
    toast.success("Campo atualizado!");
  };

  const handleExcluirCampo = () => {
    if (!formulario || !campoExcluindo) return;
    removeCampo(formulario.id, campoExcluindo.id);
    fecharModal();
    toast.success("Campo removido.");
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !formulario) return;
    if (result.source.index === result.destination.index) return;

    const novaLista = Array.from(camposOrdenados);
    const [movido] = novaLista.splice(result.source.index, 1);
    novaLista.splice(result.destination.index, 0, movido);

    reorderCampos(
      formulario.id,
      novaLista.map((c, i) => ({ ...c, ordem: i }))
    );
  };

  const handleAbrirEditarCampo = (campo: CampoFormulario) => {
    setCampoEditando(campo);
    setModalAberto("editar-campo");
  };

  const handleAbrirExcluirCampo = (campo: CampoFormulario) => {
    setCampoExcluindo(campo);
    setModalAberto("excluir-campo");
  };

  // ─── Sem formulário: Empty State ──────────────────────────────────────────
  if (!formulario) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
            <ClipboardList className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-200">
            Nenhum formulário criado
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Crie um formulário personalizado para esta empresa e comece a
            receber submissões com os campos que mais importam.
          </p>
          <Button
            className="mt-6"
            onClick={() => setModalAberto("criar-form")}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Criar Formulário
          </Button>
        </div>

        <FormularioModal
          isOpen={modalAberto === "criar-form"}
          onClose={fecharModal}
          onSalvar={handleCriarFormulario}
        />
      </>
    );
  }

  // ─── Com formulário: Header + Campos ─────────────────────────────────────
  return (
    <>
      <div className="space-y-5">
        {/* Header do formulário */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-slate-100">
                    {formulario.titulo}
                  </CardTitle>
                  <Badge variant={formulario.ativo ? "success" : "secondary"}>
                    {formulario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {formulario.descricao && (
                  <p className="mt-1 text-sm text-slate-400">
                    {formulario.descricao}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalAberto("editar-form")}
                  leftIcon={<Pencil className="h-4 w-4" />}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setModalAberto("excluir-form")}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Campos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-5 w-5" />
                Campos
                <Badge variant="secondary" className="text-xs">
                  {camposOrdenados.length}
                </Badge>
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setModalAberto("criar-campo")}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Adicionar Campo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {camposOrdenados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">
                  Nenhum campo adicionado ainda.
                </p>
                <button
                  type="button"
                  onClick={() => setModalAberto("criar-campo")}
                  className="mt-3 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Adicionar o primeiro campo
                </button>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="campos-formulario">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {camposOrdenados.map((campo, index) => (
                        <CampoListItem
                          key={campo.id}
                          campo={campo}
                          index={index}
                          onEditar={handleAbrirEditarCampo}
                          onExcluir={handleAbrirExcluirCampo}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <FormularioModal
        isOpen={modalAberto === "editar-form"}
        onClose={fecharModal}
        onSalvar={handleEditarFormulario}
        initialData={{
          titulo: formulario.titulo,
          descricao: formulario.descricao,
          ativo: formulario.ativo,
        }}
      />

      <ConfirmModal
        isOpen={modalAberto === "excluir-form"}
        titulo="Excluir Formulário"
        descricao={`Tem certeza que deseja excluir o formulário "${formulario.titulo}"? Esta ação não pode ser desfeita.`}
        onConfirmar={handleExcluirFormulario}
        onCancelar={fecharModal}
      />

      <CampoModal
        isOpen={modalAberto === "criar-campo"}
        onClose={fecharModal}
        onSalvar={handleCriarCampo}
      />

      {campoEditando && (
        <CampoModal
          isOpen={modalAberto === "editar-campo"}
          onClose={fecharModal}
          onSalvar={handleEditarCampo}
          initialData={{
            label: campoEditando.label,
            tipo: campoEditando.tipo,
            obrigatorio: campoEditando.obrigatorio,
            placeholder: campoEditando.placeholder,
            descricao: campoEditando.descricao,
            opcoes: campoEditando.opcoes,
          }}
        />
      )}

      {campoExcluindo && (
        <ConfirmModal
          isOpen={modalAberto === "excluir-campo"}
          titulo="Excluir Campo"
          descricao={`Tem certeza que deseja excluir o campo "${campoExcluindo.label}"?`}
          onConfirmar={handleExcluirCampo}
          onCancelar={fecharModal}
        />
      )}
    </>
  );
};
