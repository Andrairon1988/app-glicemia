import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AlertaGrave } from "@/components/alerta-grave";
import { BadgeFaixa } from "@/components/badge-faixa";
import { ItemMedicao } from "@/components/item-medicao";
import { buttonVariants } from "@/components/ui/button";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { chaveDia, formatarDataHora, formatarHora, rotuloDia } from "@/lib/datas";
import { classificar } from "@/lib/glicemia/classificar";
import { rotuloMomento } from "@/lib/glicemia/momentos";
import { medicoesDeHoje, ultimaMedicao } from "@/lib/medicoes";
import { cn } from "@/lib/utils";

// Telas com dados do usuário logado: sempre carregadas na hora do acesso
// (sem pré-carregamento), por isso ficam fora da validação de "navegação instantânea".
export const instant = false;

export default function InicioPage() {
  return (
    <>
      <h1 className="sr-only">Início</h1>
      <Link
        href="/medicoes/nova"
        className={cn(buttonVariants({ size: "lg" }), "h-14 w-full text-lg")}
      >
        <Plus aria-hidden="true" className="size-6" />
        Nova medição
      </Link>

      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </>
  );
}

async function Conteudo() {
  const { usuario, perfil } = await exigirCadastroCompleto();
  const [faixas, ultima, hoje] = await Promise.all([
    obterFaixas(),
    ultimaMedicao(),
    medicoesDeHoje(),
  ]);
  const nome = perfil.nome_paciente || usuario.nome;

  if (!ultima) {
    return (
      <section className="rounded-xl border p-6 text-center">
        <h2 className="text-xl font-semibold">Olá, {nome}!</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Nenhuma medição registrada ainda. Toque em <strong>Nova medição</strong> para
          começar.
        </p>
      </section>
    );
  }

  const classe = classificar(ultima.valor_mg_dl, faixas);
  const ehHoje = chaveDia(ultima.medido_em) === chaveDia(new Date());

  return (
    <>
      <section aria-labelledby="titulo-ultima" className="flex flex-col gap-3 rounded-xl border p-5">
        <h2 id="titulo-ultima" className="text-base font-medium text-muted-foreground">
          Última medição de {nome}
        </h2>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-5xl font-bold tabular-nums">{ultima.valor_mg_dl}</span>
          <span className="text-lg text-muted-foreground">mg/dL</span>
          <BadgeFaixa classe={classe} className="text-base" />
        </div>
        <p className="text-base text-muted-foreground">
          {rotuloMomento(ultima.momento)} ·{" "}
          {ehHoje ? `Hoje às ${formatarHora(ultima.medido_em)}` : formatarDataHora(ultima.medido_em)}
        </p>
        <AlertaGrave classe={classe} valor={ultima.valor_mg_dl} />
      </section>

      <section aria-labelledby="titulo-hoje" className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 id="titulo-hoje" className="text-xl font-semibold">
            {rotuloDia(chaveDia(new Date()))}
          </h2>
          <Link href="/medicoes" className="text-base font-medium underline underline-offset-4">
            Ver histórico
          </Link>
        </div>
        {hoje.length === 0 ? (
          <p className="text-base text-muted-foreground">Nenhuma medição hoje.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {hoje.map((m) => (
              <ItemMedicao key={m.id} medicao={m} faixas={faixas} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
