import { ArrowDown, ArrowUp, Check, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { INFO_CLASSE, type Classe } from "@/lib/glicemia/classificar";

/**
 * Cor + ícone + texto: a cor nunca é o único indicador (acessibilidade).
 * `cor` é usada nos gráficos. Paleta validada (claro e escuro) com o validador
 * de daltonismo: #b91c1c, #ec4899, #059669, #d97706.
 */
export const ESTILO_CLASSE: Record<Classe, { classes: string; cor: string; Icone: LucideIcon }> = {
  hipo_grave: {
    classes: "bg-red-700 text-white border-red-800 dark:bg-red-600 dark:border-red-500",
    cor: "#b91c1c",
    Icone: TriangleAlert,
  },
  hipo: {
    classes:
      "bg-pink-50 text-pink-900 border-pink-300 dark:bg-pink-950 dark:text-pink-100 dark:border-pink-800",
    cor: "#ec4899",
    Icone: ArrowDown,
  },
  meta: {
    classes:
      "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-800",
    cor: "#059669",
    Icone: Check,
  },
  hiper: {
    classes:
      "bg-amber-50 text-amber-950 border-amber-400 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700",
    cor: "#d97706",
    Icone: ArrowUp,
  },
  hiper_grave: {
    classes: "bg-red-700 text-white border-red-800 dark:bg-red-600 dark:border-red-500",
    cor: "#b91c1c",
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
