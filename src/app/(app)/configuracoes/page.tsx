import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
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

      <Secao titulo="Privacidade">
        <p className="text-base">
          Leia os{" "}
          <Link href="/termos" className="font-medium underline underline-offset-4">
            Termos de Uso e a Política de Privacidade
          </Link>
          . A exportação de dados e a exclusão da conta chegam na próxima fase do projeto.
        </p>
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
