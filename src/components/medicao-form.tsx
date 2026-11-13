"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { atualizarMedicao, criarMedicao } from "@/app/actions/medicoes";
import { AlertaGrave } from "@/components/alerta-grave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { campoParaISO, paraCampoDataHora } from "@/lib/datas";
import { INFO_CLASSE, type Classe } from "@/lib/glicemia/classificar";
import { MOMENTOS, sugerirMomento } from "@/lib/glicemia/momentos";
import { medicaoSchema } from "@/lib/validacao";

const formSchema = z.object({
  valor_mg_dl: medicaoSchema.shape.valor_mg_dl,
  // O campo é preenchido e lido sempre no horário de Brasília (ver lib/datas.ts).
  data_hora: z
    .string()
    .min(1, "Informe data e hora.")
    .refine((v) => Date.parse(campoParaISO(v)) <= Date.now() + 5 * 60 * 1000, {
      error: "A data e a hora não podem estar no futuro.",
    }),
  momento: medicaoSchema.shape.momento,
  medicamento: z.string().trim().max(100, "Use no máximo 100 caracteres."),
  dose: z.string().trim().max(50, "Use no máximo 50 caracteres."),
  observacao: z.string().trim().max(500, "Use no máximo 500 caracteres."),
});
type Entrada = z.input<typeof formSchema>;
type Saida = z.output<typeof formSchema>;

/** Sugestões para o campo de medicamento (o usuário pode digitar qualquer outro). */
const SUGESTOES_MEDICAMENTO = [
  "Insulina rápida / ultrarrápida",
  "Insulina regular",
  "Insulina NPH",
  "Insulina lenta (basal)",
  "Metformina",
  "Glibenclamida",
  "Gliclazida",
  "Dapagliflozina",
  "Empagliflozina",
  "Sitagliptina",
];

const classeCampo =
  "h-12 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";

export type MedicaoInicial = {
  id: string;
  valor_mg_dl: number;
  medido_em: string;
  momento: Entrada["momento"];
  medicamento: string | null;
  dose: string | null;
  observacao: string | null;
};

export function MedicaoForm({ inicial }: { inicial?: MedicaoInicial }) {
  const router = useRouter();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<{ classe: Classe; valor: number } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Entrada, unknown, Saida>({
    resolver: zodResolver(formSchema),
    defaultValues: valoresIniciais(inicial, null),
  });

  // Preenche data/hora e momento UMA vez, ao abrir a tela (o relógio só é
  // conhecido no navegador). Não pode reagir a mudanças de `inicial`: depois de
  // salvar uma edição a página recarrega os dados, e reiniciar o formulário
  // apagaria o alerta de valor grave que acabou de ser mostrado.
  useLayoutEffect(() => {
    reset(valoresIniciais(inicial, new Date()));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intencional: só na abertura
  }, []);

  async function enviar(dados: Saida) {
    setMensagem(null);
    const entrada = {
      valor_mg_dl: dados.valor_mg_dl,
      medido_em: campoParaISO(dados.data_hora),
      momento: dados.momento,
      medicamento: dados.medicamento,
      dose: dados.dose,
      observacao: dados.observacao,
    };

    const resultado = inicial
      ? await atualizarMedicao(inicial.id, entrada)
      : await criarMedicao(entrada);

    if (!resultado.ok) {
      setMensagem(resultado.mensagem);
      for (const [campo, msgs] of Object.entries(resultado.erros ?? {})) {
        const nome = (campo === "medido_em" ? "data_hora" : campo) as keyof Entrada;
        if (msgs?.[0]) setError(nome, { message: msgs[0] });
      }
      return;
    }

    if (INFO_CLASSE[resultado.classe].grave) {
      setAlerta({ classe: resultado.classe, valor: resultado.valor });
      return;
    }

    toast.success(inicial ? "Medição atualizada." : "Medição salva.");
    router.push(inicial ? "/medicoes" : "/");
  }

  if (alerta) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-base font-medium">Medição salva.</p>
        <AlertaGrave classe={alerta.classe} valor={alerta.valor} />
        <Button size="lg" className="h-12 text-base" onClick={() => router.push("/")}>
          Entendi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="flex flex-col gap-5" noValidate>
      <Campo id="valor_mg_dl" rotulo="Glicemia (mg/dL)" erro={errors.valor_mg_dl?.message}>
        <Input
          id="valor_mg_dl"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoFocus={!inicial}
          placeholder="Ex.: 110"
          className="h-14 text-2xl font-bold tabular-nums"
          aria-invalid={Boolean(errors.valor_mg_dl)}
          aria-describedby="valor_mg_dl_erro"
          {...register("valor_mg_dl")}
        />
      </Campo>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="data_hora" rotulo="Data e hora (horário de Brasília)" erro={errors.data_hora?.message}>
          <input
            id="data_hora"
            type="datetime-local"
            className={classeCampo}
            aria-invalid={Boolean(errors.data_hora)}
            aria-describedby="data_hora_erro"
            {...register("data_hora")}
          />
        </Campo>

        <Campo id="momento" rotulo="Momento" erro={errors.momento?.message}>
          <select
            id="momento"
            className={classeCampo}
            aria-invalid={Boolean(errors.momento)}
            aria-describedby="momento_erro"
            {...register("momento")}
          >
            {MOMENTOS.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.rotulo}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-base font-medium">Insulina / medicamento (opcional)</legend>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Campo id="medicamento" rotulo="Nome" erro={errors.medicamento?.message}>
            <Input
              id="medicamento"
              list="sugestoes-medicamento"
              placeholder="Ex.: Insulina rápida"
              className="h-12 text-base"
              aria-invalid={Boolean(errors.medicamento)}
              aria-describedby="medicamento_erro"
              {...register("medicamento")}
            />
            <datalist id="sugestoes-medicamento">
              {SUGESTOES_MEDICAMENTO.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Campo>
          <Campo id="dose" rotulo="Dose" erro={errors.dose?.message}>
            <Input
              id="dose"
              placeholder="Ex.: 10 UI ou 850 mg"
              className="h-12 text-base"
              aria-invalid={Boolean(errors.dose)}
              aria-describedby="dose_erro"
              {...register("dose")}
            />
          </Campo>
        </div>
      </fieldset>

      <Campo id="observacao" rotulo="Observação (opcional)" erro={errors.observacao?.message}>
        <Textarea
          id="observacao"
          rows={3}
          placeholder="Ex.: comi bolo, fiz exercício, estava gripado…"
          className="text-base"
          aria-invalid={Boolean(errors.observacao)}
          aria-describedby="observacao_erro"
          {...register("observacao")}
        />
      </Campo>

      {mensagem && (
        <p role="alert" className="text-base font-medium text-destructive">
          {mensagem}
        </p>
      )}

      <Button type="submit" size="lg" className="h-12 text-base" disabled={isSubmitting}>
        {isSubmitting ? "Salvando…" : inicial ? "Salvar alterações" : "Salvar medição"}
      </Button>
    </form>
  );
}

/**
 * Valores do formulário. `agora` é null na renderização do servidor
 * (o relógio do aparelho só é conhecido no navegador).
 */
function valoresIniciais(inicial: MedicaoInicial | undefined, agora: Date | null): Entrada {
  const dataBase = inicial ? new Date(inicial.medido_em) : agora;
  return {
    valor_mg_dl: inicial ? String(inicial.valor_mg_dl) : "",
    data_hora: dataBase ? paraCampoDataHora(dataBase) : "",
    momento: inicial?.momento ?? (agora ? sugerirMomento(agora) : "jejum"),
    medicamento: inicial?.medicamento ?? "",
    dose: inicial?.dose ?? "",
    observacao: inicial?.observacao ?? "",
  };
}

function Campo({
  id,
  rotulo,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-base">
        {rotulo}
      </Label>
      {children}
      {erro && (
        <p id={`${id}_erro`} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
