"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { loginFormSchema, type LoginFormSchema } from "@/schemas/usuario.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sparkles, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const handleLogin = async (data: LoginFormSchema) => {
    clearError();
    const success = await login(data);
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Lado esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-900/30 p-12 flex-col justify-between relative overflow-hidden">
        {/* Efeitos de background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo e título */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              Nexus
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Sistema de Gestão de<br />
            <span className="text-cyan-400">Projetos e Inovação</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Gerencie demandas, projetos, squads e produtos de forma integrada e eficiente.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Gestão completa de demandas e inovação</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Acompanhamento de projetos em tempo real</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Squads e alocações inteligentes</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Dashboard consolidado e multi-tenant</span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-slate-500">
          © 2026 Nexus SGPI. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Nexus</span>
          </div>

          {/* Card de login */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
              <p className="text-slate-400">Entre com suas credenciais para acessar</p>
            </div>

            {/* Erro de autenticação */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-lg",
                      "bg-slate-900/50 border border-slate-700",
                      "text-slate-100 placeholder-slate-500",
                      "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
                      "transition-all",
                      errors.email && "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("senha")}
                    className={cn(
                      "w-full pl-10 pr-12 py-3 rounded-lg",
                      "bg-slate-900/50 border border-slate-700",
                      "text-slate-100 placeholder-slate-500",
                      "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
                      "transition-all",
                      errors.senha && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-xs text-red-400">{errors.senha.message}</p>
                )}
              </div>

              {/* Botão de login */}
              <Button
                type="submit"
                className="w-full py-3 text-base"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Credenciais de teste */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 text-center mb-3">
                Credenciais de teste (ambiente de desenvolvimento)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900/50 border border-slate-700/30">
                  <p className="text-slate-400">Admin</p>
                  <p className="text-slate-300 font-mono">admin@nexus.com</p>
                </div>
                <div className="p-2 rounded bg-slate-900/50 border border-slate-700/30">
                  <p className="text-slate-400">Gestor</p>
                  <p className="text-slate-300 font-mono">gestor@nexus.com</p>
                </div>
                <div className="p-2 rounded bg-slate-900/50 border border-slate-700/30">
                  <p className="text-slate-400">Analista</p>
                  <p className="text-slate-300 font-mono">analista@nexus.com</p>
                </div>
                <div className="p-2 rounded bg-slate-900/50 border border-slate-700/30">
                  <p className="text-slate-400">Dev</p>
                  <p className="text-slate-300 font-mono">dev@nexus.com</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                Senha: <span className="font-mono text-slate-400">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
