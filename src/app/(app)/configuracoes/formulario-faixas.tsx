"use client";

import { useActionState } from "react";
import { salvarFaixas, type EstadoConfig } from "@/app/actions/configuracoes";
import { BadgeFaixa } from "@/components/badge-faixa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FAIXAS_PADRAO, type Faixas } from "@/lib/glicemia/classificar";

const CAMPOS: { campo: keyof Faixas; rotulo: string; ajuda: string }[] = [
  {
    campo: "limite_hipo_grave",
    rotulo: "Hipoglicemia grave abaixo de",
    ajuda: "Valores menores que este mostram o alerta vermelho.",
  },
  {
    campo: "limite_hipo",
    rotulo: "Meta começa em",
    ajuda: "Abaixo deste valor é hipoglicemia.",
  },
  {
    campo: "limite_hiper",
    rotulo: "Meta vai até",
    ajuda: "Acima deste valor é hiperglicemia.",
  },
  {
    campo: "limite_hiper_grave",
    rotulo: "Hiperglicemia grave acima de",
    ajuda: "Valores maiores que este mostram o alerta vermelho.",
  },
];

export function FormularioFaixas({ faixas }: { faixas: Faixas }) {
  const [estado, enviar, enviando] = useActionState<EstadoConfig, FormData>(salvarFaixas, {});
  const valor = (campo: keyof Faixas) => estado.valores?.[campo] ?? String(faixas[campo]);
  const ehPadrao = (Object.keys(FAIXAS_PADRAO) as (keyof Faixas)[]).every(
    (c) => faixas[c] === FAIXAS_PADRAO[c],
  );

  return (
    <form
      // Recria os campos quando os valores salvos mudam (ex.: após restaurar o padrão).
      key={JSON.stringify(faixas)}
      action={enviar}
      className="flex flex-col gap-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {CAMPOS.map(({ campo, rotulo, ajuda }) => {
          const erro = estado.erros?.[campo]?.[0];
          return (
            <div key={campo} className="flex flex-col gap-2">
              <Label htmlFor={campo} className="text-base">
                {rotulo} (mg/dL)
              </Label>
              <Input
                key={valor(campo)}
                id={campo}
                name={campo}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={valor(campo)}
                className="h-12 text-lg tabular-nums"
                aria-invalid={Boolean(erro)}
                aria-describedby={`${campo}_ajuda`}
              />
              <p id={`${campo}_ajuda`} className={erro ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
                {erro ?? ajuda}
              </p>
            </div>
          );
        })}
      </div>

      <ResumoFaixas faixas={faixas} />

      <p
        role="status"
        className={estado.ok ? "text-base font-medium text-emerald-700 dark:text-emerald-400" : "text-base font-medium text-destructive"}
      >
        {estado.mensagem}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" name="acao" value="salvar" size="lg" className="h-12 text-base" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar faixas"}
        </Button>
        <Button
          type="submit"
          name="acao"
          value="restaurar"
          variant="outline"
          size="lg"
          className="h-12 text-base"
          disabled={enviando || ehPadrao}
        >
          Restaurar padrão (54 / 70 / 180 / 250)
        </Button>
      </div>
    </form>
  );
}

/** Mostra como os valores serão classificados com as faixas salvas. */
function ResumoFaixas({ faixas }: { faixas: Faixas }) {
  const linhas = [
    { classe: "hipo_grave", texto: `abaixo de ${faixas.limite_hipo_grave}` },
    { classe: "hipo", texto: `de ${faixas.limite_hipo_grave} a ${faixas.limite_hipo - 1}` },
    { classe: "meta", texto: `de ${faixas.limite_hipo} a ${faixas.limite_hiper}` },
    { classe: "hiper", texto: `de ${faixas.limite_hiper + 1} a ${faixas.limite_hiper_grave}` },
    { classe: "hiper_grave", texto: `acima de ${faixas.limite_hiper_grave}` },
  ] as const;

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-base font-medium">Como os valores são classificados hoje:</p>
      <ul className="flex flex-col gap-2">
        {linhas.map(({ classe, texto }) => (
          <li key={classe} className="flex flex-wrap items-center gap-2 text-base">
            <BadgeFaixa classe={classe} />
            <span className="tabular-nums">{texto} mg/dL</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
