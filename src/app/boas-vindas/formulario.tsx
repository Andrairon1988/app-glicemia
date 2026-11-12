"use client";

import Link from "next/link";
import { useActionState } from "react";
import { concluirBoasVindas, type EstadoFormulario } from "@/app/actions/perfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormularioBoasVindas({ nomeInicial }: { nomeInicial: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoFormulario, FormData>(
    concluirBoasVindas,
    {},
  );

  return (
    <form action={enviar} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome_paciente" className="text-base">
          Nome do paciente
        </Label>
        <Input
          id="nome_paciente"
          name="nome_paciente"
          defaultValue={nomeInicial}
          autoComplete="name"
          className="h-12 text-base"
          aria-invalid={Boolean(estado.erros?.nome_paciente)}
          aria-describedby="nome_ajuda nome_erro"
          required
        />
        <p id="nome_ajuda" className="text-sm text-muted-foreground">
          Quem terá a glicemia acompanhada (você ou a pessoa de quem você cuida).
        </p>
        {estado.erros?.nome_paciente && (
          <p id="nome_erro" className="text-sm font-medium text-destructive">
            {estado.erros.nome_paciente[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <input
            id="aceite"
            name="aceite"
            type="checkbox"
            className="mt-0.5 size-6 shrink-0 accent-primary"
            aria-invalid={Boolean(estado.erros?.aceite)}
            aria-describedby="aceite_erro"
            required
          />
          <Label htmlFor="aceite" className="text-base leading-snug font-normal">
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="font-medium underline">
              Termos de Uso e a Política de Privacidade
            </Link>
            , e autorizo o armazenamento das minhas informações de saúde para uso
            neste aplicativo.
          </Label>
        </div>
        {estado.erros?.aceite && (
          <p id="aceite_erro" className="text-sm font-medium text-destructive">
            {estado.erros.aceite[0]}
          </p>
        )}
      </div>

      {estado.mensagem && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {estado.mensagem}
        </p>
      )}

      <Button type="submit" size="lg" className="h-12 text-base" disabled={enviando}>
        {enviando ? "Salvando…" : "Começar"}
      </Button>
    </form>
  );
}
