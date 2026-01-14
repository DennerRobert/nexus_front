"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  type EspecialidadeColaborador,
  type AreaEspecialidade,
  type Senioridade,
  type Tecnologia,
  AREA_ESPECIALIDADE_LABELS,
  SENIORIDADE_LABELS,
  TECNOLOGIA_LABELS,
  TECNOLOGIAS_POR_AREA,
} from "@/interfaces/colaborador.interface";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface EspecialidadeSelectorProps {
  value: EspecialidadeColaborador[];
  onChange: (value: EspecialidadeColaborador[]) => void;
  error?: string;
}

const emptyEspecialidade: EspecialidadeColaborador = {
  area: "frontend",
  senioridade: "pleno",
  tecnologias: [],
  tecnologiasCustom: [],
};

export const EspecialidadeSelector = ({
  value,
  onChange,
  error,
}: EspecialidadeSelectorProps) => {
  const [customTechInput, setCustomTechInput] = useState<Record<number, string>>({});

  const handleAddEspecialidade = () => {
    onChange([...value, { ...emptyEspecialidade }]);
  };

  const handleRemoveEspecialidade = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleUpdateEspecialidade = (
    index: number,
    field: keyof EspecialidadeColaborador,
    fieldValue: unknown
  ) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: fieldValue };
    
    // Se mudou a área, limpar as tecnologias
    if (field === "area") {
      newValue[index].tecnologias = [];
      newValue[index].tecnologiasCustom = [];
    }
    
    onChange(newValue);
  };

  const handleToggleTecnologia = (index: number, tech: Tecnologia) => {
    const especialidade = value[index];
    const techs = especialidade.tecnologias;
    const newTechs = techs.includes(tech)
      ? techs.filter((t) => t !== tech)
      : [...techs, tech];
    handleUpdateEspecialidade(index, "tecnologias", newTechs);
  };

  const handleAddCustomTech = (index: number) => {
    const techName = customTechInput[index]?.trim();
    if (!techName) return;
    
    const especialidade = value[index];
    const currentCustom = especialidade.tecnologiasCustom || [];
    
    if (!currentCustom.includes(techName)) {
      handleUpdateEspecialidade(index, "tecnologiasCustom", [...currentCustom, techName]);
    }
    
    setCustomTechInput({ ...customTechInput, [index]: "" });
  };

  const handleRemoveCustomTech = (index: number, tech: string) => {
    const especialidade = value[index];
    const newCustom = (especialidade.tecnologiasCustom || []).filter((t) => t !== tech);
    handleUpdateEspecialidade(index, "tecnologiasCustom", newCustom);
  };

  const handleKeyDownCustomTech = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTech(index);
    }
  };

  return (
    <div className="space-y-4">
      {value.map((especialidade, index) => {
        const tecnologiasDisponiveis = TECNOLOGIAS_POR_AREA[especialidade.area] || [];
        
        return (
          <Card key={index} className="relative">
            <CardContent className="pt-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => handleRemoveEspecialidade(index)}
                aria-label="Remover especialidade"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <Select
                  label="Área de Especialidade"
                  value={especialidade.area}
                  onChange={(e) =>
                    handleUpdateEspecialidade(index, "area", e.target.value as AreaEspecialidade)
                  }
                  options={Object.entries(AREA_ESPECIALIDADE_LABELS).map(([val, label]) => ({
                    value: val,
                    label,
                  }))}
                />
                <Select
                  label="Senioridade"
                  value={especialidade.senioridade}
                  onChange={(e) =>
                    handleUpdateEspecialidade(index, "senioridade", e.target.value as Senioridade)
                  }
                  options={Object.entries(SENIORIDADE_LABELS).map(([val, label]) => ({
                    value: val,
                    label,
                  }))}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">
                  Tecnologias
                </label>
                
                {/* Tecnologias pré-definidas */}
                <div className="flex flex-wrap gap-2">
                  {tecnologiasDisponiveis.map((tech) => {
                    const isSelected = especialidade.tecnologias.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleToggleTecnologia(index, tech)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                            : "border-slate-600 text-slate-400 hover:border-slate-500"
                        )}
                      >
                        {TECNOLOGIA_LABELS[tech]}
                      </button>
                    );
                  })}
                </div>

                {/* Tecnologias customizadas */}
                {especialidade.tecnologiasCustom && especialidade.tecnologiasCustom.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {especialidade.tecnologiasCustom.map((tech) => (
                      <Badge
                        key={tech}
                        variant="info"
                        className="flex items-center gap-1 pr-1"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTech(index, tech)}
                          className="ml-1 rounded-full p-0.5 hover:bg-slate-600"
                          aria-label={`Remover ${tech}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Adicionar tecnologia customizada */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Adicionar tecnologia..."
                      value={customTechInput[index] || ""}
                      onChange={(e) =>
                        setCustomTechInput({ ...customTechInput, [index]: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDownCustomTech(index, e)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddCustomTech(index)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {especialidade.tecnologias.length === 0 && (
                  <p className="text-xs text-yellow-400">
                    Selecione pelo menos uma tecnologia
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddEspecialidade}
        leftIcon={<Plus className="h-4 w-4" />}
        className="w-full"
      >
        Adicionar Especialidade
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
