import { ArrowDown, ArrowUp, Check, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { INFO_CLASSE, type Classe } from "@/lib/glicemia/classificar";

/** Cor + ícone + texto: a cor nunca é o único indicador (acessibilidade). */
export const ESTILO_CLASSE: Record<Classe, { classes: string; Icone: LucideIcon }> = {
  hipo_grave: {
    classes: "bg-red-700 text-white border-red-800 dark:bg-red-600 dark:border-red-500",
    Icone: TriangleAlert,
  },
  hipo: {
    classes:
      "bg-red-50 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-100 dark:border-red-800",
    Icone: ArrowDown,
  },
  meta: {
    classes:
      "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800",
    Icone: Check,
  },
  hiper: {
    classes:
      "bg-amber-50 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700",
    Icone: ArrowUp,
  },
  hiper_grave: {
    classes: "bg-red-700 text-white border-red-800 dark:bg-red-600 dark:border-red-500",
    Icone: TriangleAlert,
  },
};

export function BadgeFaixa({ classe, className }: { classe: Classe; className?: string }) {
  const { classes, Icone } = ESTILO_CLASSE[classe];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap",
        classes,
        className,
      )}
    >
      <Icone aria-hidden="true" className="size-4" />
      {INFO_CLASSE[classe].rotulo}
    </span>
  );
}
