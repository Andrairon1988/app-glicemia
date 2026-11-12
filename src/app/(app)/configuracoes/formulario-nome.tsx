"use client";

import { useActionState } from "react";
import { salvarNomePaciente, type EstadoConfig } from "@/app/actions/configuracoes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormularioNome({ nome }: { nome: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoConfig, FormData>(salvarNomePaciente, {});
  const erro = estado.erros?.nome_paciente?.[0];

  return (
    <form action={enviar} className="flex flex-col gap-3" noValidate>
      <Label htmlFor="nome_paciente" className="text-base">
        Nome do paciente
      </Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          key={estado.valores?.nome_paciente ?? nome}
          id="nome_paciente"
          name="nome_paciente"
          defaultValue={estado.valores?.nome_paciente ?? nome}
          autoComplete="name"
          className="h-12 flex-1 text-base"
          aria-invalid={Boolean(erro)}
          aria-describedby="nome_paciente_msg"
        />
        <Button type="submit" size="lg" className="h-12 text-base" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar nome"}
        </Button>
      </div>
      <p
        id="nome_paciente_msg"
        role="status"
        className={erro || !estado.ok ? "text-sm font-medium text-destructive" : "text-sm font-medium text-emerald-700 dark:text-emerald-400"}
      >
        {erro ?? estado.mensagem}
      </p>
    </form>
  );
}
