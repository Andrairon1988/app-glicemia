"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotaoImprimir() {
  return (
    <Button size="lg" className="h-12 flex-1 text-base" onClick={() => window.print()}>
      <Printer aria-hidden="true" className="size-5" />
      Imprimir / Salvar PDF
    </Button>
  );
}
