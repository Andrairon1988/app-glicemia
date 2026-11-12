import { TriangleAlert } from "lucide-react";
import { INFO_CLASSE, orientacaoGrave, type Classe } from "@/lib/glicemia/classificar";

/** Destaque exibido quando uma medição cai numa faixa grave. */
export function AlertaGrave({ classe, valor }: { classe: Classe; valor: number }) {
  const orientacao = orientacaoGrave(classe);
  if (!orientacao) return null;

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border-2 border-red-700 bg-red-50 p-4 text-red-950 dark:border-red-500 dark:bg-red-950 dark:text-red-50"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-7 shrink-0 text-red-700 dark:text-red-400" />
      <div className="space-y-1">
        <p className="text-lg font-bold">
          {INFO_CLASSE[classe].rotulo}: {valor} mg/dL
        </p>
        <p className="text-base">{orientacao}</p>
      </div>
    </div>
  );
}
