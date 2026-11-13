"use client";

import { useActionState } from "react";
import { criarLink, type EstadoLink } from "@/app/actions/compartilhamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VALIDADES } from "@/lib/links";

const classeSelect =
  "h-12 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";

export function FormularioLink() {
  const [estado, enviar, enviando] = useActionState<EstadoLink, FormData>(criarLink, {});

  return (
    <form action={enviar} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome" className="text-base">
            Para quem é o link?
          </Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Ex.: Mãe, Dra. Ana"
            maxLength={60}
            className="h-12 text-base"
            aria-invalid={Boolean(estado.erros?.nome)}
            aria-describedby="nome_erro"
          />
          {estado.erros?.nome && (
            <p id="nome_erro" className="text-sm font-medium text-destructive">
              {estado.erros.nome[0]}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="validade" className="text-base">
            Validade
          </Label>
          <select id="validade" name="validade" defaultValue="30" className={classeSelect}>
            {VALIDADES.map((v) => (
              <option key={v.valor} value={v.valor}>
                {v.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p
        role="status"
        className={estado.ok ? "text-base font-medium text-emerald-700 dark:text-emerald-400" : "text-base font-medium text-destructive"}
      >
        {estado.mensagem}
      </p>

      <Button type="submit" size="lg" className="h-12 text-base" disabled={enviando}>
        {enviando ? "Criando…" : "Criar link"}
      </Button>
    </form>
  );
}
