import { type NextRequest } from "next/server";
import { exigirCadastroCompleto, obterFaixas } from "@/lib/dados";
import { chaveDia } from "@/lib/datas";
import { gerarCsvMedicoes } from "@/lib/exportar";
import { lerDias } from "@/lib/periodos";
import { medicoesDoPeriodo, todasMedicoes } from "@/lib/medicoes";

/** Baixa as medições em CSV. ?dias=7|14|30|90 ou ?dias=tudo */
export async function GET(request: NextRequest) {
  await exigirCadastroCompleto();
  const parametro = request.nextUrl.searchParams.get("dias") ?? "tudo";
  const tudo = parametro === "tudo";
  const dias = lerDias(parametro, 30);

  const [faixas, medicoes] = await Promise.all([
    obterFaixas(),
    tudo ? todasMedicoes() : medicoesDoPeriodo(dias).then((r) => r.medicoes),
  ]);

  const nome = `glicemia-${tudo ? "todas" : `${dias}-dias`}-${chaveDia(new Date())}.csv`;
  return new Response(gerarCsvMedicoes(medicoes, faixas), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
