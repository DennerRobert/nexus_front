"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Tabs, TabPanel } from "@/components/Tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { useEmpresaStore } from "@/stores/empresa.store";
import {
  PERFIL_USUARIO_LABELS,
  PERFIL_USUARIO_COLORS,
} from "@/interfaces/usuario.interface";
import {
  editarPerfilSchema,
  alterarSenhaSchema,
  type EditarPerfilSchemaType,
  type AlterarSenhaSchemaType,
} from "@/schemas/perfil.schema";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Clock,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────

const getInitials = (nome: string): string => {
  const words = nome.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// ─── Sub-componentes ────────────────────────────────────────────────────────

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-700/40 last:border-0">
    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <div className="text-sm text-slate-200">{value}</div>
    </div>
  </div>
);

const PasswordField = ({
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input>) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        label={label}
        error={error}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-[2.15rem] text-slate-500 hover:text-slate-300 transition-colors"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// ─── Aba: Dados Pessoais ────────────────────────────────────────────────────

const TabDadosPessoais = () => {
  const { usuario, atualizarPerfil } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditarPerfilSchemaType>({
    resolver: zodResolver(editarPerfilSchema),
    defaultValues: {
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
    },
  });

  const onSubmit = async (data: EditarPerfilSchemaType) => {
    await new Promise((r) => setTimeout(r, 400));
    atualizarPerfil(data);
    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <TabPanel>
      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>
            Atualize seu nome e e-mail de acesso ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              error={errors.nome?.message}
              {...register("nome")}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 text-xs text-slate-400">
              <Info className="h-4 w-4 flex-shrink-0 text-slate-500" />
              O e-mail também é usado para autenticação. Após alterar, use o
              novo e-mail para fazer login.
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabPanel>
  );
};

// ─── Aba: Segurança ─────────────────────────────────────────────────────────

const TabSeguranca = () => {
  const { alterarSenha } = useAuthStore();
  const [sucesso, setSucesso] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<AlterarSenhaSchemaType>({
    resolver: zodResolver(alterarSenhaSchema),
  });

  const onSubmit = async (data: AlterarSenhaSchemaType) => {
    await new Promise((r) => setTimeout(r, 400));

    const ok = alterarSenha(data.senhaAtual, data.novaSenha);

    if (!ok) {
      setError("senhaAtual", { message: "Senha atual incorreta" });
      return;
    }

    reset();
    setSucesso(true);
    toast.success("Senha alterada com sucesso!");
    setTimeout(() => setSucesso(false), 5000);
  };

  return (
    <TabPanel>
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>
            Para garantir a segurança, informe sua senha atual antes de
            definir uma nova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sucesso && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Senha alterada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
            <PasswordField
              label="Senha atual"
              placeholder="••••••"
              error={errors.senhaAtual?.message}
              {...register("senhaAtual")}
            />

            <hr className="border-slate-700/50" />

            <PasswordField
              label="Nova senha"
              placeholder="Mínimo 6 caracteres"
              error={errors.novaSenha?.message}
              {...register("novaSenha")}
            />
            <PasswordField
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              error={errors.confirmarSenha?.message}
              {...register("confirmarSenha")}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Lock className="h-4 w-4" />}
              >
                Alterar senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TabPanel>
  );
};

// ─── Aba: Informações da Conta ──────────────────────────────────────────────

const TabInformacoes = () => {
  const { usuario } = useAuthStore();
  const { getById: getTenant } = useTenantStore();
  const { getById: getEmpresa } = useEmpresaStore();

  const tenant = usuario?.tenantId ? getTenant(usuario.tenantId) : null;
  const empresaPrincipal = usuario?.empresaId ? getEmpresa(usuario.empresaId) : null;
  const empresasVinculadas = usuario?.empresaIds
    .map((id) => getEmpresa(id))
    .filter(Boolean) ?? [];

  if (!usuario) return null;

  return (
    <TabPanel>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dados da conta */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Conta</CardTitle>
            <CardDescription>Informações de identificação e acesso.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <InfoRow
              icon={Shield}
              label="Identificador único (ID)"
              value={
                <span className="font-mono text-xs text-slate-400 break-all">
                  {usuario.id}
                </span>
              }
            />
            <InfoRow
              icon={User}
              label="Perfil de acesso"
              value={
                <span
                  className={cn(
                    "inline-block rounded px-2 py-0.5 text-xs font-medium text-white",
                    PERFIL_USUARIO_COLORS[usuario.perfil]
                  )}
                >
                  {PERFIL_USUARIO_LABELS[usuario.perfil]}
                </span>
              }
            />
            <InfoRow
              icon={Building2}
              label="Tenant"
              value={tenant?.nome ?? usuario.tenantId}
            />
            <InfoRow
              icon={Building2}
              label="Empresa principal"
              value={empresaPrincipal?.nome ?? usuario.empresaId}
            />
            <InfoRow
              icon={Calendar}
              label="Membro desde"
              value={formatDate(usuario.createdAt)}
            />
            <InfoRow
              icon={Clock}
              label="Última atualização"
              value={formatDateTime(usuario.updatedAt)}
            />
          </CardContent>
        </Card>

        {/* Empresas vinculadas */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Vinculadas</CardTitle>
            <CardDescription>
              Unidades às quais você tem acesso no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {empresasVinculadas.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma empresa vinculada.</p>
            ) : (
              <ul className="space-y-2">
                {empresasVinculadas.map((empresa) => (
                  <li
                    key={empresa!.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-200">{empresa!.nome}</span>
                    </div>
                    {empresa!.id === usuario.empresaId && (
                      <Badge variant="primary">Principal</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </TabPanel>
  );
};

// ─── Página Principal ───────────────────────────────────────────────────────

const PerfilPage = () => {
  const { usuario } = useAuthStore();

  const initials = useMemo(
    () => (usuario ? getInitials(usuario.nome) : "??"),
    [usuario]
  );

  if (!usuario) return null;

  const tabs = [
    {
      id: "dados",
      label: "Dados Pessoais",
      icon: <User className="h-4 w-4" />,
      content: <TabDadosPessoais />,
    },
    {
      id: "seguranca",
      label: "Segurança",
      icon: <Lock className="h-4 w-4" />,
      content: <TabSeguranca />,
    },
    {
      id: "informacoes",
      label: "Informações da Conta",
      icon: <Info className="h-4 w-4" />,
      content: <TabInformacoes />,
    },
  ];

  return (
    <Layout title="Meu Perfil" subtitle="Gerencie suas informações e segurança">
      <div className="space-y-6">
        {/* Hero do perfil */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar com iniciais */}
              <div
                className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 text-3xl font-bold text-white shadow-lg shadow-cyan-500/20"
                aria-hidden
              >
                {initials}
              </div>

              {/* Informações principais */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-100">
                  {usuario.nome}
                </h2>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                    {usuario.email}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white",
                      PERFIL_USUARIO_COLORS[usuario.perfil]
                    )}
                  >
                    <Shield className="h-3 w-3" />
                    {PERFIL_USUARIO_LABELS[usuario.perfil]}
                  </span>
                  <Badge variant={usuario.ativo ? "success" : "danger"}>
                    {usuario.ativo ? "Conta ativa" : "Conta inativa"}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Membro desde {formatDate(usuario.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de edição */}
        <Tabs tabs={tabs} defaultTab="dados" />
      </div>
    </Layout>
  );
};

export default PerfilPage;
