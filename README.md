# Glicemia

App web para registrar e acompanhar medições de glicemia (açúcar no sangue). Funciona no celular e no computador, em qualquer tamanho de tela.

**▶ Acesse:** https://app-glicemia-ten.vercel.app

> ⚠️ **Projeto de estudo e portfólio.** Este aplicativo não substitui orientação médica. Metas e tratamento devem ser definidos pelo seu médico.

## Funcionalidades (Fase 1 — MVP)

- **Login com Google** e aceite de Termos de Uso / Política de Privacidade (LGPD: dados de saúde são dados sensíveis).
- **Registro de medições**: valor em mg/dL, data e hora, momento (jejum, antes/depois das refeições etc.), insulina/medicamento com dose e observação.
- **Classificação automática** em 5 faixas (hipoglicemia grave, hipoglicemia, na meta, hiperglicemia, hiperglicemia grave), com cor + ícone + texto.
- **Alerta visual** com orientação quando o valor está numa faixa grave.
- **Faixas-alvo personalizáveis** (padrão da Sociedade Brasileira de Diabetes: 54 / 70 / 180 / 250 mg/dL).
- **Histórico** agrupado por dia, com filtros por período e momento, edição e exclusão.
- **Responsivo** (mobile-first, barra de navegação inferior no celular), **tema claro/escuro** e **acessibilidade** (fontes grandes, áreas de toque ≥ 44px, navegação por teclado, leitores de tela).

## Tecnologias

| Camada | Escolha |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) + TypeScript |
| Banco e autenticação | [Supabase](https://supabase.com) (Postgres + Auth com Google) |
| Segurança | Row Level Security: cada usuário só acessa os próprios dados, garantido pelo banco |
| Interface | Tailwind CSS 4 + shadcn/ui |
| Formulários e validação | React Hook Form + Zod (mesmas regras no navegador e no servidor) |
| Testes | Vitest (regras de classificação, validação e datas) |
| Hospedagem | Vercel |

## Rodando localmente

Pré-requisitos: Node.js 20+ e um projeto no Supabase com o login do Google configurado.

```bash
git clone https://github.com/Andrairon1988/app-glicemia.git
cd app-glicemia
npm install
cp .env.example .env.local   # preencha com a URL e a chave pública do seu projeto Supabase
```

1. No Supabase, abra o **SQL Editor** e execute `supabase/migrations/0001_inicial.sql` (cria as tabelas, as regras de segurança e o gatilho de novo usuário).
2. Em **Authentication → URL Configuration**, adicione `http://localhost:3000/auth/callback` às Redirect URLs.
3. Rode:

```bash
npm run dev    # http://localhost:3000
npm test       # testes automáticos
npm run build  # build de produção
```

## Estrutura

```
src/
  app/
    (app)/            telas logadas: início, medições, configurações
    actions/          Server Actions (salvar/excluir, perfil, configurações)
    entrar/ auth/     login com Google e retorno do OAuth
    boas-vindas/      primeiro acesso (nome + aceite dos termos)
    termos/           Termos de Uso e Política de Privacidade
  components/         componentes de interface
  lib/
    glicemia/         regras de domínio (classificação, momentos) + testes
    supabase/         clientes Supabase (navegador, servidor, proxy)
    validacao.ts      esquemas Zod
    datas.ts          datas no horário de Brasília
  proxy.ts            renova a sessão e protege as rotas
supabase/migrations/  estrutura do banco
```

## Próximas fases

- ✅ **Fase 2 (análise):** aba Resumo com tempo na meta, distribuição por faixa, indicadores, gráfico de evolução e média por momento.
- **Fase 3 (compartilhamento e LGPD):** relatório PDF/CSV para o médico, link somente leitura para familiares, exportação e exclusão da conta.

As premissas completas do projeto estão em [`PROJETO.md`](PROJETO.md).
