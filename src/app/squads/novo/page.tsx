"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useSquadStore } from "@/stores/squad.store";
import { useProjetoStore } from "@/stores/projeto.store";
import { squadSchema, type SquadSchemaType } from "@/schemas/squad.schema";
import { ArrowLeft, Save } from "lucide-react";

const NovoSquadPage = () => {
  const router = useRouter();
  const { create } = useSquadStore();
  const { getAtivos: getProjetosAtivos } = useProjetoStore();
  const projetos = getProjetosAtivos();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SquadSchemaType>({
    resolver: zodResolver(squadSchema),
  });

  const handleFormSubmit = (data: SquadSchemaType) => {
    try {
      const squad = create(data);
      toast.success("Squad criado com sucesso!");
      router.push(`/squads/${squad.id}`);
    } catch {
      toast.error("Erro ao criar squad");
    }
  };

  return (
    <Layout
      title="Novo Squad"
      subtitle="Criar um squad transversal"
    >
      <div className="mb-6">
        <Link href="/squads">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para Squads
          </Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Squad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nome do Squad"
              placeholder="Ex: Squad App Mobile"
              error={errors.nome?.message}
              {...register("nome")}
            />
            <Textarea
              label="Objetivo"
              placeholder="Qual é o objetivo deste squad?"
              rows={3}
              error={errors.objetivo?.message}
              {...register("objetivo")}
            />
            <Select
              label="Projeto Vinculado"
              placeholder="Selecione um projeto"
              options={projetos.map((p) => ({ value: p.id, label: p.nome }))}
              error={errors.projetoId?.message}
              {...register("projetoId")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/squads">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Criar Squad
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default NovoSquadPage;
