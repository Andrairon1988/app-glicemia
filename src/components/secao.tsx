/** Bloco com título (card) usado nas telas do app, no relatório e na tela do familiar. */
export function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const id = `secao-${titulo.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-xl border p-5 print:break-inside-avoid print:gap-2 print:p-3"
    >
      <h2 id={id} className="text-xl font-semibold print:text-base">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
