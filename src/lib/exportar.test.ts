import { describe, expect, it } from "vitest";
import { FAIXAS_PADRAO } from "@/lib/glicemia/classificar";
import { gerarCsvMedicoes } from "./exportar";

describe("gerarCsvMedicoes", () => {
  const csv = gerarCsvMedicoes(
    [
      {
        valor_mg_dl: 48,
        medido_em: "2026-11-12T10:30:00Z",
        momento: "jejum",
        medicamento: "Insulina rápida",
        dose: "4 UI",
        observacao: 'Tontura; "forte"\nmediu de novo',
      },
      { valor_mg_dl: 120, medido_em: "2026-11-12T16:00:00Z", momento: "depois_almoco", medicamento: null, dose: null, observacao: null },
    ],
    FAIXAS_PADRAO,
  );
  const linhas = csv.split("\r\n");

  it("começa com BOM e cabeçalho separado por ponto e vírgula", () => {
    expect(csv.startsWith("﻿")).toBe(true);
    expect(linhas[0]).toBe("﻿Data;Hora;Momento;Glicemia (mg/dL);Faixa;Medicamento;Dose;Observação");
  });

  it("usa data, hora e faixa em português (horário de Brasília)", () => {
    expect(linhas[1].startsWith("12/11/2026;07:30;Jejum;48;Hipoglicemia grave;Insulina rápida;4 UI;")).toBe(true);
    // A quebra de linha da 1ª observação fica entre aspas (\n), não separa registros (\r\n).
    expect(linhas[2]).toBe("12/11/2026;13:00;Depois do almoço;120;Na meta;;;");
  });

  it("neutraliza texto que o Excel leria como fórmula", () => {
    const perigoso = gerarCsvMedicoes(
      [
        {
          valor_mg_dl: 100,
          medido_em: "2026-11-12T10:30:00Z",
          momento: "jejum",
          medicamento: '=HYPERLINK("http://mal.example","ver")',
          dose: "+2 UI",
          observacao: "@SOMA(1;2)",
        },
      ],
      FAIXAS_PADRAO,
    );
    const linha = perigoso.split("\r\n")[1];
    expect(linha).toContain(`"'=HYPERLINK(""http://mal.example"",""ver"")"`);
    expect(linha).toContain(";'+2 UI;");
    expect(linha).toContain(`"'@SOMA(1;2)"`);
    // números (a glicemia) continuam números
    expect(linha).toContain(";100;");
  });

  it("protege campos com ponto e vírgula, aspas e quebra de linha", () => {
    expect(csv).toContain('"Tontura; ""forte""\nmediu de novo"');
  });
});
