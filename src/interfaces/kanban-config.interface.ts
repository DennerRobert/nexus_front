import type { EtapaDemanda } from "./etapa-demanda.interface";

export interface EtapaKanbanConfig {
  etapa: EtapaDemanda;
  titulo: string;
  visivel: boolean;
  ordem: number;
}

export interface KanbanEmpresaConfig {
  empresaId: string;
  etapas: EtapaKanbanConfig[];
  updatedAt: Date;
}
