"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { useAnexoDemandaStore } from "@/stores/anexo-demanda.store";
import type { AnexoDemanda } from "@/interfaces/anexo-demanda.interface";
import {
  EXTENSOES_PERMITIDAS,
  TAMANHO_MAXIMO_ARQUIVO,
  MAX_ARQUIVOS_POR_DEMANDA,
  formatarTamanhoArquivo,
} from "@/interfaces/anexo-demanda.interface";
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  Loader2,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

interface AnexoUploaderProps {
  demandaId: string;
  usuarioId: string;
  anexos: AnexoDemanda[];
  onAnexosChange?: (anexos: AnexoDemanda[]) => void;
  disabled?: boolean;
  className?: string;
}

const getIconeArquivo = (tipo: string) => {
  if (tipo.includes("pdf") || tipo.includes("word") || tipo.includes("document")) {
    return <FileText className="h-5 w-5 text-blue-400" />;
  }
  if (tipo.includes("excel") || tipo.includes("spreadsheet")) {
    return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
  }
  if (tipo.includes("powerpoint") || tipo.includes("presentation")) {
    return <Presentation className="h-5 w-5 text-orange-400" />;
  }
  if (tipo.includes("image")) {
    return <Image className="h-5 w-5 text-purple-400" />;
  }
  return <File className="h-5 w-5 text-slate-400" />;
};

export const AnexoUploader = ({
  demandaId,
  usuarioId,
  anexos,
  onAnexosChange,
  disabled = false,
  className,
}: AnexoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { adicionar, remover, podeAdicionarMais } = useAnexoDemandaStore();

  const podeAdicionar = podeAdicionarMais(demandaId);
  const arquivosRestantes = MAX_ARQUIVOS_POR_DEMANDA - anexos.length;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!podeAdicionar || disabled) return;

      setIsUploading(true);

      for (const file of acceptedFiles) {
        if (anexos.length >= MAX_ARQUIVOS_POR_DEMANDA) {
          toast.error(`Limite de ${MAX_ARQUIVOS_POR_DEMANDA} arquivos atingido`);
          break;
        }

        const resultado = await adicionar(demandaId, file, usuarioId);

        if (resultado.sucesso && resultado.anexo) {
          onAnexosChange?.([...anexos, resultado.anexo]);
          toast.success(`Arquivo "${file.name}" anexado com sucesso`);
        } else if (resultado.erro) {
          toast.error(resultado.erro);
        }
      }

      setIsUploading(false);
    },
    [demandaId, usuarioId, anexos, adicionar, onAnexosChange, podeAdicionar, disabled]
  );

  const handleRemover = (anexo: AnexoDemanda) => {
    remover(anexo.id);
    onAnexosChange?.(anexos.filter((a) => a.id !== anexo.id));
    toast.success(`Arquivo "${anexo.nomeOriginal}" removido`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || !podeAdicionar,
    maxSize: TAMANHO_MAXIMO_ARQUIVO,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-slate-700 hover:border-slate-600",
          (disabled || !podeAdicionar) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" />
          )}
          <div>
            <p className="text-sm text-slate-300">
              {isDragActive
                ? "Solte os arquivos aqui..."
                : "Arraste arquivos ou clique para selecionar"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {EXTENSOES_PERMITIDAS.join(", ")} • Máx. {TAMANHO_MAXIMO_ARQUIVO / 1024 / 1024}MB por arquivo
            </p>
            {podeAdicionar && (
              <p className="text-xs text-slate-500">
                {arquivosRestantes} arquivo{arquivosRestantes !== 1 ? "s" : ""} restante{arquivosRestantes !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lista de anexos */}
      {anexos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">
            Arquivos anexados ({anexos.length}/{MAX_ARQUIVOS_POR_DEMANDA})
          </p>
          <div className="space-y-2">
            {anexos.map((anexo) => (
              <div
                key={anexo.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  {getIconeArquivo(anexo.tipo)}
                  <div>
                    <p className="text-sm text-slate-200">{anexo.nomeOriginal}</p>
                    <p className="text-xs text-slate-500">
                      {formatarTamanhoArquivo(anexo.tamanho)}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemover(anexo)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
