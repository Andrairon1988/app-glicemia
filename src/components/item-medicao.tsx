import Link from "next/link";
import { ChevronRight, Pill } from "lucide-react";
import { BadgeFaixa } from "@/components/badge-faixa";
import { formatarHora } from "@/lib/datas";
import { classificar, INFO_CLASSE, type Faixas } from "@/lib/glicemia/classificar";
import { rotuloMomento } from "@/lib/glicemia/momentos";
import type { Medicao } from "@/lib/medicoes";

/** Uma linha da lista de medições. Toque/clique abre a edição. */
export function ItemMedicao({ medicao, faixas }: { medicao: Medicao; faixas: Faixas }) {
  const classe = classificar(medicao.valor_mg_dl, faixas);
  const hora = formatarHora(medicao.medido_em);

  return (
    <li>
      <Link
        href={`/medicoes/${medicao.id}/editar`}
        className="flex min-h-16 items-center gap-3 rounded-lg px-3 py-3 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={[
          `${medicao.valor_mg_dl} mg/dL às ${hora}`,
          INFO_CLASSE[classe].rotulo,
          rotuloMomento(medicao.momento),
          [medicao.medicamento, medicao.dose].filter(Boolean).join(" "),
          medicao.observacao,
          "Editar",
        ]
          .filter(Boolean)
          .join(". ")}
      >
        <time dateTime={medicao.medido_em} className="w-12 shrink-0 text-base tabular-nums text-muted-foreground">
          {hora}
        </time>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl font-bold tabular-nums">{medicao.valor_mg_dl}</span>
            <span className="text-sm text-muted-foreground">mg/dL</span>
            <BadgeFaixa classe={classe} />
          </div>
          <p className="text-sm text-muted-foreground">{rotuloMomento(medicao.momento)}</p>
          {(medicao.medicamento || medicao.dose) && (
            <p className="flex items-center gap-1 text-sm">
              <Pill aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">
                {[medicao.medicamento, medicao.dose].filter(Boolean).join(" · ")}
              </span>
            </p>
          )}
          {medicao.observacao && (
            <p className="line-clamp-2 text-sm text-muted-foreground italic">{medicao.observacao}</p>
          )}
        </div>

        <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}
