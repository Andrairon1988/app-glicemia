"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { excluirConta } from "@/app/actions/compartilhamento";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Exclusão definitiva: exige digitar EXCLUIR para evitar acidentes. */
export function ExcluirConta() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    setExcluindo(true);
    setErro(null);
    const resultado = await excluirConta(texto);
    // Em caso de sucesso o servidor redireciona para /entrar; aqui só chega erro.
    setErro(resultado.mensagem);
    setExcluindo(false);
  }

  return (
    <AlertDialog
      open={aberto}
      onOpenChange={(abrir) => {
        setAberto(abrir);
        if (!abrir) {
          setTexto("");
          setErro(null);
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="lg" className="h-12 w-full text-base sm:w-auto">
            <TriangleAlert aria-hidden="true" className="size-5" />
            Excluir minha conta
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir a conta definitivamente?</AlertDialogTitle>
          <AlertDialogDescription>
            Todas as medições, configurações e links de compartilhamento serão apagados para
            sempre. Isso não pode ser desfeito. Se quiser guardar uma cópia, baixe seus dados
            antes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmacao" className="text-base">
            Para confirmar, digite <strong>EXCLUIR</strong>
          </Label>
          <Input
            id="confirmacao"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            autoComplete="off"
            className="h-12 text-base"
            aria-invalid={Boolean(erro)}
            aria-describedby="confirmacao_erro"
          />
          {erro && (
            <p id="confirmacao_erro" role="alert" className="text-sm font-medium text-destructive">
              {erro}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg" className="h-11">
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            size="lg"
            className="h-11"
            onClick={confirmar}
            disabled={excluindo || texto.trim().toUpperCase() !== "EXCLUIR"}
          >
            {excluindo ? "Excluindo…" : "Excluir para sempre"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
