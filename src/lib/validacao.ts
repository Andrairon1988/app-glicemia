import { z } from "zod";
import { VALORES_MOMENTO } from "@/lib/glicemia/momentos";

/** Texto opcional: vazio vira null. */
const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .nullish()
    .transform((v) => (v ? v : null));

/**
 * Número inteiro digitado num campo de texto: vazio → "Informe…";
 * vírgula aceita como separador ("12,5" → 12.5, depois recusado por não ser inteiro);
 * letras → "Digite apenas números".
 */
const inteiro = (mensagemVazio: string) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      const texto = v.trim().replace(",", ".");
      return texto === "" ? undefined : Number(texto);
    },
    z
      .number({
        error: (problema) => (problema.input === undefined ? mensagemVazio : "Digite apenas números."),
      })
      .int("Use um número inteiro, sem vírgula."),
  );

/** Tolerância para pequenas diferenças de relógio entre o aparelho e o servidor. */
const TOLERANCIA_FUTURO_MS = 5 * 60 * 1000;

export const medicaoSchema = z.object({
  valor_mg_dl: inteiro("Informe o valor da glicemia.").pipe(
    z.number().min(20, "O valor mínimo é 20 mg/dL.").max(600, "O valor máximo é 600 mg/dL."),
  ),
  medido_em: z.iso
    .datetime({ offset: true, error: "Informe data e hora válidas." })
    .refine((v) => Date.parse(v) <= Date.now() + TOLERANCIA_FUTURO_MS, {
      error: "A data e a hora não podem estar no futuro.",
    }),
  momento: z.enum(VALORES_MOMENTO, { error: "Escolha o momento da medição." }),
  medicamento: textoOpcional(100),
  dose: textoOpcional(50),
  observacao: textoOpcional(500),
});
export type MedicaoEntrada = z.input<typeof medicaoSchema>;
export type MedicaoDados = z.output<typeof medicaoSchema>;

const limite = (nome: string) =>
  inteiro(`Informe ${nome}.`).pipe(
    z.number().min(20, "Mínimo de 20 mg/dL.").max(600, "Máximo de 600 mg/dL."),
  );

export const faixasSchema = z
  .object({
    limite_hipo_grave: limite("o limite de hipoglicemia grave"),
    limite_hipo: limite("o limite de hipoglicemia"),
    limite_hiper: limite("o limite de hiperglicemia"),
    limite_hiper_grave: limite("o limite de hiperglicemia grave"),
  })
  .refine(
    (f) =>
      f.limite_hipo_grave < f.limite_hipo &&
      f.limite_hipo < f.limite_hiper &&
      f.limite_hiper < f.limite_hiper_grave,
    { error: "Os limites precisam estar em ordem crescente.", path: ["limite_hiper_grave"] },
  );

export const nomePacienteSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome do paciente.")
  .max(100, "Use no máximo 100 caracteres.");

export const boasVindasSchema = z.object({
  nome_paciente: nomePacienteSchema,
  aceite: z.literal("on", { error: "É preciso aceitar os termos para continuar." }),
});
