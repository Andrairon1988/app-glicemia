import type { Metadata } from "next";
import Link from "next/link";
import { AVISO_MEDICO } from "@/lib/textos";

export const metadata: Metadata = { title: "Termos de Uso e Privacidade · Glicemia" };

export default function TermosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <article className="space-y-6 text-base leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Termos de Uso e Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 12/11/2026</p>
        </header>

        <p className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          <strong>Aviso médico:</strong> {AVISO_MEDICO}
        </p>

        <h2>1. Sobre o aplicativo</h2>
        <p>
          O Glicemia é um projeto de estudo e portfólio, oferecido gratuitamente e
          &quot;no estado em que se encontra&quot;, sem garantia de disponibilidade. Ele
          serve para registrar e visualizar medições de glicemia. Não é um
          dispositivo médico e não faz diagnóstico nem recomenda tratamento.
        </p>

        <h2>2. Dados coletados</h2>
        <ul>
          <li>Da sua conta Google: nome, e-mail e identificador da conta.</li>
          <li>Informados por você: nome do paciente, medições de glicemia (valor, data, hora e momento), medicamentos, doses, observações e faixas-alvo.</li>
        </ul>
        <p>
          As informações de saúde são <strong>dados pessoais sensíveis</strong> segundo a
          Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018, art. 11) e são tratadas
          com base no seu <strong>consentimento</strong>, dado ao aceitar estes termos.
        </p>

        <h2>3. Uso dos dados</h2>
        <ul>
          <li>Os dados são usados apenas para exibir seu histórico, gráficos e relatórios dentro do aplicativo.</li>
          <li>Não vendemos, não compartilhamos com terceiros e não usamos seus dados para publicidade.</li>
          <li>Somente você acessa seus dados. Em versões futuras, você poderá gerar um link de leitura para familiares, que pode ser revogado a qualquer momento.</li>
        </ul>

        <h2>4. Armazenamento e segurança</h2>
        <p>
          Os dados ficam armazenados no Supabase (banco de dados em nuvem), com
          comunicação criptografada (HTTPS) e regras que impedem um usuário de acessar
          dados de outro. Nenhum sistema é totalmente imune a falhas. Por isso, evite
          registrar informações além das necessárias.
        </p>

        <h2>5. Seus direitos</h2>
        <ul>
          <li>Acessar, corrigir e excluir suas medições a qualquer momento.</li>
          <li>Exportar todos os seus dados e excluir sua conta definitivamente (funcionalidade prevista para a próxima fase do projeto).</li>
          <li>Revogar o consentimento, o que implica a exclusão da conta e dos dados.</li>
        </ul>

        <h2>6. Responsabilidades</h2>
        <p>
          Você é responsável pela exatidão das informações registradas. Em situações de
          emergência, procure atendimento médico imediatamente (SAMU 192).
        </p>

        <p className="pt-4">
          <Link href="/" className="font-medium underline">
            Voltar ao aplicativo
          </Link>
        </p>
      </article>
    </main>
  );
}
