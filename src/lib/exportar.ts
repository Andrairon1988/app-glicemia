import { formatarDataHora } from "@/lib/datas";
import { classificar, INFO_CLASSE, type Faixas } from "@/lib/glicemia/classificar";
import { rotuloMomento, type Momento } from "@/lib/glicemia/momentos";

type MedicaoCsv = {
  valor_mg_dl: number;
  medido_em: string;
  momento: Momento;
  medicamento: string | null;
  dose: string | null;
  observacao: string | null;
};

/** Escapa um campo para CSV (aspas, separador e quebras de linha). */
function campo(valor: string | number | null): string {
  const texto = valor === null ? "" : String(valor);
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/**
 * CSV no padrão do Excel em português: separador ";" e BOM UTF-8
 * (para os acentos aparecerem corretamente).
 */
export function gerarCsvMedicoes(medicoes: MedicaoCsv[], faixas: Faixas): string {
  const cabecalho = ["Data", "Hora", "Momento", "Glicemia (mg/dL)", "Faixa", "Medicamento", "Dose", "Observação"];
  const linhas = medicoes.map((m) => {
    const [data, hora] = formatarDataHora(m.medido_em).split(" às ");
    return [
      data,
      hora,
      rotuloMomento(m.momento),
      m.valor_mg_dl,
      INFO_CLASSE[classificar(m.valor_mg_dl, faixas)].rotulo,
      m.medicamento,
      m.dose,
      m.observacao,
    ]
      .map(campo)
      .join(";");
  });
  return "﻿" + [cabecalho.join(";"), ...linhas].join("\r\n") + "\r\n";
}
