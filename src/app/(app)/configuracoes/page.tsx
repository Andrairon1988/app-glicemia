import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Share2, Sheet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { cn } from "@/lib/utils";
import { ExcluirConta } from "./excluir-conta";
import { FormularioFaixas } from "./formulario-faixas";
import { FormularioNome } from "./formulario-nome";
import { SeletorTema } from "./seletor-tema";

export const metadata: Metadata = { title: "Configurações · Glicemia" };

export default function ConfiguracoesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Configurações</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando…</p>}>
        <Conteudo />
      </Suspense>
    </>
  );
}

async function Conteudo() {
  const { usuario, perfil } = await exigirCadastroCompleto();
  const faixas = await obterFaixas();
  const botao = cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 flex-1 text-base");

  return (
    <>
      <Secao titulo="Paciente">
        <FormularioNome nome={perfil.nome_paciente ?? usuario.nome} />
        <p className="text-sm text-muted-foreground">Conta Google: {usuario.email}</p>
      </Secao>

      <Secao titulo="Faixas-alvo">
        <p className="text-base">
          Os valores padrão seguem a referência geral da Sociedade Brasileira de Diabetes.{" "}
          <strong>As metas variam de pessoa para pessoa:</strong> ajuste apenas conforme a
          orientação do seu médico.
        </p>
        <FormularioFaixas faixas={faixas} />
      </Secao>

      <Secao titulo="Aparência">
        <SeletorTema />
      </Secao>

      <Secao titulo="Compartilhamento e relatórios">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/compartilhar" className={botao}>
            <Share2 aria-hidden="true" className="size-5" />
            Links para familiares
          </Link>
          <Link href="/relatorio" className={botao}>
            <FileText aria-hidden="true" className="size-5" />
            Relatório para o médico
          </Link>
        </div>
      </Secao>

      <Secao titulo="Privacidade e seus dados">
        <p className="text-base">
          Leia os{" "}
          <Link href="/termos" className="font-medium underline underline-offset-4">
            Termos de Uso e a Política de Privacidade
          </Link>
          . Pela LGPD, você pode baixar uma cópia de todos os seus dados e excluir sua conta a
          qualquer momento.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="/exportar/tudo" className={botao}>
            <Download aria-hidden="true" className="size-5" />
            Baixar todos os meus dados
          </a>
          <a href="/exportar/medicoes?dias=tudo" className={botao}>
            <Sheet aria-hidden="true" className="size-5" />
            Baixar medições (planilha)
          </a>
        </div>
        <div className="flex flex-col gap-2 border-t pt-4">
          <p className="text-base font-medium">Zona de perigo</p>
          <ExcluirConta />
        </div>
      </Secao>
    </>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const id = `secao-${titulo.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-xl border p-5">
      <h2 id={id} className="text-xl font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
