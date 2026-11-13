"use client";

import { useState, useSyncExternalStore } from "react";
import { Ban, Copy, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { desativarLink, excluirLink } from "@/app/actions/compartilhamento";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Endereço do site, conhecido só no navegador (localhost ou o domínio publicado).
const useOrigem = () =>
  useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );

// Celulares têm o menu nativo "Compartilhar" (WhatsApp, e-mail…); computadores, em geral, não.
const usePodeCompartilhar = () =>
  useSyncExternalStore(
    () => () => {},
    () => "share" in navigator,
    () => false,
  );

export function AcoesLink({
  id,
  nome,
  token,
  ativo,
}: {
  id: string;
  nome: string;
  token: string;
  ativo: boolean;
}) {
  const origem = useOrigem();
  const [ocupado, setOcupado] = useState(false);
  const url = `${origem}/compartilhado/${token}`;
  const podeCompartilhar = usePodeCompartilhar();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Link de "${nome}" copiado. Cole no WhatsApp, e-mail etc.`);
    } catch {
      toast.error("Não foi possível copiar. Selecione o endereço e copie manualmente.");
    }
  }

  async function compartilhar() {
    try {
      await navigator.share({
        title: "Acompanhe minha glicemia",
        text: `${nome}, este link mostra minhas medições de glicemia (somente leitura):`,
        url,
      });
    } catch {
      // usuário cancelou o compartilhamento
    }
  }

  async function executar(acao: () => Promise<{ ok: boolean }>, sucesso: string) {
    setOcupado(true);
    const { ok } = await acao();
    setOcupado(false);
    if (ok) toast.success(sucesso);
    else toast.error("Não foi possível concluir. Tente novamente.");
  }

  return (
    <div className="flex flex-col gap-3">
      {ativo && (
        <>
          <input
            readOnly
            value={url}
            aria-label={`Endereço do link de ${nome}`}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 w-full rounded-lg border bg-muted px-3 font-mono text-sm"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="h-11 flex-1 text-base" onClick={copiar} disabled={!origem}>
              <Copy aria-hidden="true" className="size-5" />
              Copiar link
            </Button>
            {podeCompartilhar && (
              <Button variant="outline" size="lg" className="h-11 flex-1 text-base" onClick={compartilhar}>
                <Share2 aria-hidden="true" className="size-5" />
                Enviar…
              </Button>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {ativo && (
          <Confirmar
            titulo={`Desativar o link de "${nome}"?`}
            descricao="A pessoa perde o acesso imediatamente. Para voltar a compartilhar, crie um novo link."
            rotuloAcao="Sim, desativar"
            onConfirmar={() => executar(() => desativarLink(id), "Link desativado.")}
            disabled={ocupado}
          >
            <Ban aria-hidden="true" className="size-5" />
            Desativar
          </Confirmar>
        )}
        <Confirmar
          titulo={`Excluir o link de "${nome}"?`}
          descricao="O link é apagado da lista e deixa de funcionar."
          rotuloAcao="Sim, excluir"
          onConfirmar={() => executar(() => excluirLink(id), "Link excluído.")}
          disabled={ocupado}
        >
          <Trash2 aria-hidden="true" className="size-5" />
          Excluir
        </Confirmar>
      </div>
    </div>
  );
}

function Confirmar({
  titulo,
  descricao,
  rotuloAcao,
  onConfirmar,
  disabled,
  children,
}: {
  titulo: string;
  descricao: string;
  rotuloAcao: string;
  onConfirmar: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="lg" className="h-11 flex-1 text-base" disabled={disabled}>
            {children}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg" className="h-11">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" size="lg" className="h-11" onClick={onConfirmar}>
            {rotuloAcao}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
