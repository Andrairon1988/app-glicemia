"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { ESTILO_CLASSE } from "@/components/badge-faixa";
import { FUSO } from "@/lib/datas";
import { INFO_CLASSE, type Classe, type Faixas } from "@/lib/glicemia/classificar";

export type PontoGrafico = {
  t: number; // instante em milissegundos
  valor: number;
  classe: Classe;
  momento: string;
  quando: string; // "12/11/2026 às 14:05"
};

const fmtDia = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" });

export function GraficoEvolucao({
  pontos,
  faixas,
  inicio,
  fim,
}: {
  pontos: PontoGrafico[];
  faixas: Faixas;
  inicio: number;
  fim: number;
}) {
  const maiorValor = Math.max(...pontos.map((p) => p.valor), faixas.limite_hiper_grave);
  const teto = Math.ceil((maiorValor + 20) / 50) * 50;

  return (
    // currentColor = cor "apagada" do texto: eixos, grade e linha ficam discretos.
    <div className="grafico-evolucao h-[300px] w-full text-muted-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pontos} margin={{ top: 8, right: 20, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.15} />

          {/* Faixa da meta sombreada em verde */}
          <ReferenceArea
            y1={faixas.limite_hipo}
            y2={faixas.limite_hiper}
            fill={ESTILO_CLASSE.meta.cor}
            fillOpacity={0.12}
            stroke="none"
            ifOverflow="extendDomain"
          />
          <ReferenceLine
            y={faixas.limite_hipo_grave}
            stroke={ESTILO_CLASSE.hipo_grave.cor}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <ReferenceLine
            y={faixas.limite_hiper_grave}
            stroke={ESTILO_CLASSE.hiper_grave.cor}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />

          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[inicio, fim]}
            tickFormatter={(t: number) => fmtDia.format(t)}
            stroke="currentColor"
            tick={{ fill: "currentColor", fontSize: 13 }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[0, teto]}
            // Marcas da escala nos limites que importam (meta e alerta), não em números "redondos".
            ticks={[0, faixas.limite_hipo, faixas.limite_hiper, faixas.limite_hiper_grave, teto]}
            interval={0}
            stroke="currentColor"
            tick={{ fill: "currentColor", fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />

          <Tooltip
            content={(props) => <Dica {...props} />}
            cursor={{ stroke: "currentColor", strokeOpacity: 0.4 }}
          />

          <Line
            type="linear"
            dataKey="valor"
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth={2}
            isAnimationActive={false}
            dot={(props) => <Ponto key={props.index} {...props} />}
            activeDot={(props) => <Ponto key={props.index} {...props} ativo />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Cada medição: círculo na cor da faixa com um anel da cor do fundo (separa pontos próximos). */
function Ponto(props: { cx?: number; cy?: number; payload?: PontoGrafico; ativo?: boolean }) {
  const { cx, cy, payload, ativo } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={ativo ? 7 : 5}
      fill={ESTILO_CLASSE[payload.classe].cor}
      strokeWidth={2}
      className="stroke-background"
    />
  );
}

function Dica({ active, payload }: TooltipContentProps) {
  const ponto = payload?.[0]?.payload as PontoGrafico | undefined;
  if (!active || !ponto) return null;
  const { Icone } = ESTILO_CLASSE[ponto.classe];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-lg font-bold tabular-nums">
        {ponto.valor} <span className="text-sm font-normal text-muted-foreground">mg/dL</span>
      </p>
      <p className="flex items-center gap-1 text-sm font-medium">
        <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: ESTILO_CLASSE[ponto.classe].cor }} />
        <Icone aria-hidden="true" className="size-4" />
        {INFO_CLASSE[ponto.classe].rotulo}
      </p>
      <p className="text-sm text-muted-foreground">{ponto.momento}</p>
      <p className="text-sm text-muted-foreground">{ponto.quando}</p>
    </div>
  );
}
