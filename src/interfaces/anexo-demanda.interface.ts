// Interface de anexo de demanda
export interface AnexoDemanda {
  id: string;
  demandaId: string;
  nome: string;
  nomeOriginal: string;
  tipo: string; // MIME type (ex: "application/pdf", "image/png")
  tamanho: number; // tamanho em bytes
  uploadPorId: string; // ID do usuário que fez upload
  createdAt: Date;
}

// Tipos de arquivo permitidos
export const TIPOS_ARQUIVO_PERMITIDOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
];

// Extensões permitidas
export const EXTENSOES_PERMITIDAS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".txt",
  ".csv",
];

// Tamanho máximo por arquivo (10MB)
export const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024;

// Número máximo de arquivos por demanda
export const MAX_ARQUIVOS_POR_DEMANDA = 10;

// Helper para formatar tamanho de arquivo
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper para obter ícone baseado no tipo
export const getIconeArquivo = (tipo: string): string => {
  if (tipo.includes("pdf")) return "file-text";
  if (tipo.includes("word") || tipo.includes("document")) return "file-text";
  if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "file-spreadsheet";
  if (tipo.includes("powerpoint") || tipo.includes("presentation")) return "file-presentation";
  if (tipo.includes("image")) return "image";
  if (tipo.includes("text")) return "file";
  return "file";
};
