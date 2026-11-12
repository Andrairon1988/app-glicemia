import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ItemMedicao } from "@/components/item-medicao";
import { Button, buttonVariants } from "@/components/ui/button";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { chaveDia, rotuloDia } from "@/lib/datas";
import { MOMENTOS, VALORES_MOMENTO, type Momento } from "@/lib/glicemia/momentos";
import { listarMedicoes, PERIODOS, POR_PAGINA, type Filtros, type Medicao } from "@/lib/medicoes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Histórico · Glicemia" };

type SearchParams = PageProps<"/medicoes">["searchParams"];

function lerFiltros(sp: Awaited<SearchParams>): Filtros {
  const texto = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const periodo = PERIODOS.find((p) => p.valor === texto(sp.periodo))?.valor ?? "30";
  const momento = (VALORES_MOMENTO as string[]).includes(texto(sp.momento))
    ? (texto(sp.momento) as Momento)
    : null;
  const pagina = Math.max(1, Number.parseInt(texto(sp.pagina), 10) || 1);
  return { periodo, momento, pagina };
}

const classeSelect =
  "h-12 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export default function HistoricoPage({ searchParams }: PageProps<"/medicoes">) {
  return (
    <>
      <h1 className="text-2xl font-bold">Histórico</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Conteudo({ searchParams }: { searchParams: SearchParams }) {
  await exigirCadastroCompleto();
  const filtros = lerFiltros(await searchParams);
  const [faixas, { medicoes, total }] = await Promise.all([
    obterFaixas(),
    listarMedicoes(filtros),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      {/* Formulário GET: os filtros ficam na URL (dá para salvar/compartilhar o link). */}
      <form
        method="get"
        className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="periodo" className="text-base font-medium">
            Período
          </label>
          <select id="periodo" name="periodo" defaultValue={filtros.periodo} className={classeSelect}>
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="momento" className="text-base font-medium">
            Momento
          </label>
          <select id="momento" name="momento" defaultValue={filtros.momento ?? ""} className={classeSelect}>
            <option value="">Todos</option>
            {MOMENTOS.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.rotulo}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" className="h-12 text-base">
          Filtrar
        </Button>
      </form>

      <p className="text-base text-muted-foreground" aria-live="polite">
        {total === 0
          ? "Nenhuma medição encontrada com esses filtros."
          : `${total} ${total === 1 ? "medição encontrada" : "medições encontradas"}.`}
      </p>

      {agruparPorDia(medicoes).map(([dia, doDia]) => (
        <section key={dia} aria-labelledby={`dia-${dia}`} className="flex flex-col gap-2">
          <h2 id={`dia-${dia}`} className="text-lg font-semibold">
            {rotuloDia(dia)}
          </h2>
          <ul className="divide-y rounded-xl border">
            {doDia.map((m) => (
              <ItemMedicao key={m.id} medicao={m} faixas={faixas} />
            ))}
          </ul>
        </section>
      ))}

      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="flex items-center justify-between gap-2">
          <LinkPagina filtros={filtros} pagina={filtros.pagina - 1} desabilitado={filtros.pagina <= 1}>
            ← Anteriores
          </LinkPagina>
          <span className="text-base text-muted-foreground">
            Página {filtros.pagina} de {totalPaginas}
          </span>
          <LinkPagina
            filtros={filtros}
            pagina={filtros.pagina + 1}
            desabilitado={filtros.pagina >= totalPaginas}
          >
            Seguintes →
          </LinkPagina>
        </nav>
      )}
    </>
  );
}

function agruparPorDia(medicoes: Medicao[]): [string, Medicao[]][] {
  const grupos = new Map<string, Medicao[]>();
  for (const m of medicoes) {
    const dia = chaveDia(m.medido_em);
    grupos.set(dia, [...(grupos.get(dia) ?? []), m]);
  }
  return [...grupos.entries()];
}

function LinkPagina({
  filtros,
  pagina,
  desabilitado,
  children,
}: {
  filtros: Filtros;
  pagina: number;
  desabilitado: boolean;
  children: React.ReactNode;
}) {
  const classes = cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 text-base");
  if (desabilitado) {
    return (
      <span aria-disabled="true" className={cn(classes, "pointer-events-none opacity-50")}>
        {children}
      </span>
    );
  }
  const params = new URLSearchParams({ periodo: filtros.periodo, pagina: String(pagina) });
  if (filtros.momento) params.set("momento", filtros.momento);
  return (
    <Link href={`/medicoes?${params}`} className={classes}>
      {children}
    </Link>
  );
}
