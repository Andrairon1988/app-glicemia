import { ESTILO_CLASSE } from "@/components/badge-faixa";
import { INFO_CLASSE } from "@/lib/glicemia/classificar";
import { ORDEM_CLASSES, type Resumo } from "@/lib/glicemia/estatisticas";

/**
 * Barra segmentada: como as medições se dividem entre as 5 faixas.
 * Cada segmento é separado por 2px; a legenda sempre traz ícone + texto + %.
 */
export function BarraFaixas({ resumo }: { resumo: Resumo }) {
  const visiveis = ORDEM_CLASSES.filter((c) => resumo.porClasse[c].quantidade > 0);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex h-6 w-full gap-[2px] overflow-hidden rounded-[4px]"
        role="img"
        aria-label={ORDEM_CLASSES.map(
          (c) => `${INFO_CLASSE[c].rotulo}: ${resumo.porClasse[c].percentual}%`,
        ).join("; ")}
      >
        {visiveis.map((c) => (
          <div
            key={c}
            className="h-full first:rounded-l-[4px] last:rounded-r-[4px]"
            style={{
              width: `${(resumo.porClasse[c].quantidade / resumo.total) * 100}%`,
              minWidth: 4,
              backgroundColor: ESTILO_CLASSE[c].cor,
            }}
          />
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 sm:gap-x-12">
        {ORDEM_CLASSES.map((c) => {
          const { Icone, cor } = ESTILO_CLASSE[c];
          const { quantidade, percentual } = resumo.porClasse[c];
          return (
            <li key={c} className="flex items-center gap-2 text-base">
              <span aria-hidden="true" className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: cor }} />
              <Icone aria-hidden="true" className="size-4 shrink-0" />
              <span className="flex-1">{INFO_CLASSE[c].rotulo}</span>
              <span className="font-semibold tabular-nums">{percentual}%</span>
              <span className="w-14 text-right text-sm text-muted-foreground tabular-nums">
                ({quantidade})
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
