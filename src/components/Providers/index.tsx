"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { DataProvider } from "./DataProvider";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <AuthProvider>
      <AuthGuard>
        <DataProvider>
          {children}
        </DataProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </AuthGuard>
    </AuthProvider>
  );
};
