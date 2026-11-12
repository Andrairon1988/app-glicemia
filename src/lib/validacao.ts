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

export const medicaoSchema = z.object({
  valor_mg_dl: z.coerce
    .number({ error: "Informe o valor da glicemia." })
    .int("Use um número inteiro.")
    .min(20, "O valor mínimo é 20 mg/dL.")
    .max(600, "O valor máximo é 600 mg/dL."),
  medido_em: z.iso.datetime({ offset: true, error: "Informe data e hora válidas." }),
  momento: z.enum(VALORES_MOMENTO, { error: "Escolha o momento da medição." }),
  medicamento: textoOpcional(100),
  dose: textoOpcional(50),
  observacao: textoOpcional(500),
});
export type MedicaoEntrada = z.input<typeof medicaoSchema>;
export type MedicaoDados = z.output<typeof medicaoSchema>;

const limite = (nome: string) =>
  z.coerce
    .number({ error: `Informe ${nome}.` })
    .int("Use um número inteiro.")
    .min(20, "Mínimo de 20 mg/dL.")
    .max(600, "Máximo de 600 mg/dL.");

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
