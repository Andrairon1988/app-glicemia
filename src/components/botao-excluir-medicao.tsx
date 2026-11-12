"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { excluirMedicao } from "@/app/actions/medicoes";
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

export function BotaoExcluirMedicao({ id, descricao }: { id: string; descricao: string }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    setExcluindo(true);
    const { ok } = await excluirMedicao(id);
    if (ok) {
      toast.success("Medição excluída.");
      router.push("/medicoes");
    } else {
      toast.error("Não foi possível excluir. Tente novamente.");
      setExcluindo(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="lg" className="h-12 w-full text-base">
            <Trash2 aria-hidden="true" className="size-5" />
            Excluir medição
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta medição?</AlertDialogTitle>
          <AlertDialogDescription>
            {descricao}. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg" className="h-11">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="lg"
            className="h-11"
            onClick={confirmar}
            disabled={excluindo}
          >
            {excluindo ? "Excluindo…" : "Sim, excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
