"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Layout = ({ children, title, subtitle, actions }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Header title={title} subtitle={subtitle} actions={actions} />
        <main className="p-6">{children}</main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(30 41 59)",
            border: "1px solid rgb(51 65 85)",
            color: "rgb(241 245 249)",
          },
        }}
      />
    </div>
  );
};

export { Sidebar } from "./Sidebar";
export { Header } from "./Header";
