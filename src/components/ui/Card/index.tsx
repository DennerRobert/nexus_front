"use client";

import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700/50 bg-slate-800/50 shadow-xl backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: CardHeaderProps) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }: CardTitleProps) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-slate-100",
        className
      )}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
}: CardDescriptionProps) => {
  return (
    <p className={cn("text-sm text-slate-400", className)}>{children}</p>
  );
};

export const CardContent = ({ children, className }: CardContentProps) => {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
};

export const CardFooter = ({ children, className }: CardFooterProps) => {
  return (
    <div
      className={cn(
        "flex items-center border-t border-slate-700/50 p-6 pt-4",
        className
      )}
    >
      {children}
    </div>
  );
};
