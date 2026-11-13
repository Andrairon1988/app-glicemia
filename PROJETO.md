# Projeto: App Web de Acompanhamento de Glicemia

> Documento de premissas do projeto, construído por entrevista. Status: **Fase 1 (MVP) publicada** em https://app-glicemia-ten.vercel.app (12/11/2026). Código: https://github.com/Andrairon1988/app-glicemia. Andamento na seção 9.1 e pontos em aberto na seção 11.

## 1. Visão geral
- **O que é:** aplicação web para registrar e acompanhar medições de glicemia (nível de açúcar no sangue).
- **Plataforma:** web responsiva, funcionando em computadores, tablets e celulares, em qualquer tamanho de tela.
- **Objetivo do projeto:** estudo e portfólio. O escopo é enxuto e não há exigências regulatórias de produto comercial, mas o app deve seguir boas práticas.

## 2. Usuários
- **Perfil:** paciente + familiares/cuidadores.
  - O **paciente** (ou um cuidador por ele) registra as medições.
  - **Familiares** consultam os mesmos dados (ex.: pais acompanhando um filho, filhos acompanhando um pai idoso).
- **Tipo de diabetes atendido:** genérico, ou seja, o app deve servir para Tipo 1, Tipo 2, gestacional e pré-diabetes. Por isso as metas (faixas-alvo) precisam ser **configuráveis** e não fixas no código.

## 3. Entrada de dados
- **Forma:** digitação manual do valor lido no glicosímetro.
- Integração com sensores contínuos (CGM) ou importação de arquivos está **fora do escopo**.

### 3.1 Campos de cada registro de glicemia
| Campo | Obrigatório | Observação |
|---|---|---|
| Valor da glicemia | Sim | Em **mg/dL**, número inteiro. Validar uma faixa plausível (ex.: 20 a 600). |
| Data e hora | Sim | Preenchidas com o momento atual, mas editáveis (para registro retroativo). |
| Momento da medição | Sim | Jejum, antes/depois do café, antes/depois do almoço, antes/depois do jantar, antes de dormir, madrugada, outro. |
| Insulina / medicamento | Não | Nome/tipo (ex.: insulina rápida, insulina lenta, metformina) e dose (unidades ou mg). |
| Observação | Não | Texto livre (alimentação, exercício, doença, estresse etc.). |

- **Unidade:** somente mg/dL (padrão brasileiro). Não haverá conversão para mmol/L.

## 4. Regras de negócio: classificação dos valores
- **Faixas padrão** (referência geral da Sociedade Brasileira de Diabetes), **editáveis pelo usuário** conforme a orientação médica:

| Classificação | Faixa padrão (mg/dL) | Cor sugerida |
|---|---|---|
| Hipoglicemia grave | < 54 | Vermelho escuro + alerta |
| Hipoglicemia | 54 a 69 | Vermelho |
| Na meta | 70 a 180 | Verde |
| Hiperglicemia | 181 a 250 | Amarelo/laranja |
| Hiperglicemia grave | > 250 | Vermelho escuro + alerta |

- **Alertas:** quando o valor cai numa faixa grave, o app mostra um **destaque visual** com orientação básica (ex.: "Valor fora da faixa segura. Siga a orientação do seu médico ou procure atendimento."). Não haverá notificações por e-mail ou push.
- A cor nunca pode ser o único indicador (acessibilidade): sempre mostrar também texto ou ícone.

## 5. Funcionalidades
### 5.1 Registro
- Criar, editar e excluir medições (com confirmação antes de excluir).
- Formulário rápido, pensado para o celular: poucos toques e teclado numérico no campo de valor.

### 5.2 Histórico em lista
- Medições em ordem cronológica decrescente, coloridas por faixa.
- Filtros por período e por momento da medição.

### 5.3 Gráfico de evolução
- Linha do tempo dos valores, com a faixa-alvo sombreada.
- Períodos: 7, 14, 30 e 90 dias.

### 5.4 Painel de resumo (dashboard)
- Indicadores do período: média, mínimo, máximo, quantidade de medições, **% na meta** (tempo na meta), quantidade de hipoglicemias e de hiperglicemias.

### 5.5 Relatório para o médico
- Exportação do período selecionado em **PDF** (resumo, gráfico e tabela) e **CSV** (dados brutos).
- Versão adequada para impressão.

### 5.6 Compartilhamento com familiares
- O paciente gera um **link somente de leitura** e o familiar acessa sem precisar criar conta.
- O link usa um token longo e aleatório, impossível de adivinhar.
- O paciente pode **revogar** o link (ou gerar outro) a qualquer momento. Opcionalmente, o link tem data de validade.
- Quem acessa pelo link vê histórico, gráfico e resumo, mas não edita nada.

## 6. Contas e acesso
- **Autenticação:** somente **login com Google** (OAuth). O app não guarda senhas.
- **Uma conta = um paciente.** Não haverá múltiplos perfis por conta.
- Somente o dono da conta registra e edita medições.
- No primeiro acesso, o usuário aceita os **Termos de Uso e a Política de Privacidade** (consentimento explícito para tratar dados de saúde). O aceite é registrado com data e hora.
- Configurações do usuário: nome do paciente e faixas-alvo personalizadas.

## 6.1 Privacidade e LGPD
Dados de saúde são **dados pessoais sensíveis** na LGPD (art. 11).
- **Aviso médico** visível no app e no relatório: "Este aplicativo não substitui orientação médica. Metas e tratamento devem ser definidos pelo seu médico."
- **Consentimento** explícito no cadastro (ver seção 6).
- **Portabilidade:** o usuário pode exportar todos os seus dados (CSV).
- **Exclusão:** o usuário pode excluir a conta e todos os dados de forma definitiva, com confirmação.
- Cada usuário acessa somente os próprios dados. O isolamento é garantido no back-end, não apenas na interface.
- Comunicação somente via HTTPS.

## 7. Requisitos não funcionais
- **Responsividade:** abordagem *mobile-first*, funcionando de 320px (celular pequeno) até monitores grandes.
- **Conectividade:** funciona **somente online**. Sem modo offline ou PWA nesta versão.
- **Idioma:** somente português (pt-BR), com datas no formato dd/mm/aaaa e horário de 24h.
- **Tema:** claro e escuro, seguindo automaticamente a preferência do sistema (com opção manual).
- **Acessibilidade reforçada** (público inclui idosos e pessoas com retinopatia diabética):
  - Fonte base grande (mínimo 16px; valores de glicemia em destaque).
  - Alto contraste (meta WCAG 2.1 nível AA).
  - Botões e áreas de toque com no mínimo 44x44px.
  - Cor nunca é o único indicador. Uso de texto e ícones junto.
  - Navegação completa por teclado e compatibilidade com leitores de tela.

## 8. Tecnologia
**Stack definida: Next.js + Supabase** (decidido em 12/11/2026).

| Camada | Escolha | Por quê |
|---|---|---|
| Linguagem | **TypeScript** | Tipagem evita erros com números e datas; padrão de mercado. |
| Framework web | **Next.js** (App Router, React) | Front e back no mesmo projeto, com Server Components e Server Actions. |
| Banco de dados | **Supabase Postgres** | Banco relacional gerenciado com plano gratuito. |
| Autenticação | **Supabase Auth com provedor Google** | Login com Google pronto, sem guardar senhas. |
| Segurança de dados | **Row Level Security (RLS)** do Postgres | Garante no banco que cada usuário só acesse as próprias medições (requisito da seção 6.1). |
| Estilo / UI | **Tailwind CSS + shadcn/ui** | Responsivo, tema claro/escuro nativo, componentes acessíveis (baseados em Radix). |
| Formulários / validação | **React Hook Form + Zod** | Validação do valor da glicemia (20–600) no cliente e no servidor. |
| Gráficos (Fase 2) | **Recharts** | Simples e bem integrado ao React. |
| Datas | **date-fns** (locale pt-BR) | Formatação dd/mm/aaaa e cálculos de período. |
| PDF (Fase 3) | **@react-pdf/renderer** | Gera o relatório para o médico. |
| Hospedagem | **Vercel** (app) + **Supabase** (banco/auth) | Planos gratuitos e deploy automático a partir do GitHub. |
| Versionamento | **Git + GitHub** | Repositório público para o portfólio. |

### 8.1 Modelo de dados inicial
- **`profiles`**: `id` (= usuário do Supabase Auth), `nome_paciente`, `termos_aceitos_em`, `criado_em`.
- **`faixas_alvo`**: `user_id`, `hipo_grave_max` (54), `hipo_max` (69), `meta_max` (180), `hiper_max` (250). Valores padrão editáveis.
- **`medicoes`**: `id`, `user_id`, `valor_mg_dl`, `medido_em` (data/hora), `momento` (enum), `medicamento`, `dose`, `observacao`, `criado_em`, `atualizado_em`.
- **`links_compartilhamento`** (Fase 3): `id`, `user_id`, `token`, `expira_em`, `revogado_em`, `criado_em`.
- Todas as tabelas com RLS ativado: o usuário só lê e escreve as linhas em que `user_id = auth.uid()`. O acesso pelo link de compartilhamento é feito no servidor, validando o token.

### 8.2 Ambiente de desenvolvimento
- Node.js LTS e npm.
- Variáveis de ambiente em `.env.local` (nunca commitado): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Credenciais OAuth do Google criadas no Google Cloud Console e configuradas no painel do Supabase.
- Ferramentas de qualidade: ESLint e Prettier.
- **Publicação:** online, em hospedagem gratuita, com código no GitHub. Sem conta de demonstração: cada visitante entra com a própria conta Google.

## 9. Escopo e fases
**Prazo:** sem prazo definido, em ritmo de estudo.

| Fase | Entregas |
|---|---|
| **Fase 1: MVP** | Login com Google, aceite de termos + aviso médico, cadastro/edição/exclusão de medições, histórico em lista com filtros, faixas-alvo padrão editáveis, destaque visual de valores graves, layout responsivo, tema claro/escuro, acessibilidade. |
| **Fase 2: Análise** | Gráfico de evolução (7/14/30/90 dias) e painel de resumo (média, mín., máx., % na meta, nº de hipo/hiperglicemias). |
| **Fase 3: Compartilhamento e LGPD** | Relatório para o médico (PDF/CSV), link somente leitura para familiares (com revogação), exportação de todos os dados e exclusão definitiva da conta. |

### 9.1 Andamento
| Fase | Situação |
|---|---|
| Fase 1: MVP | ✅ Concluída e publicada em 12/11/2026 |
| Fase 2: Análise | 🧪 Implementada em 13/11/2026: aba "Resumo" com % na meta, distribuição por faixa, indicadores (média, mín., máx., nº de medições, hipo/hiper), gráfico de evolução e média por momento. Aguardando validação. |
| Fase 3: Compartilhamento e LGPD | ⏳ Pendente |

**Decisões tomadas durante a Fase 1:**
- Horários exibidos sempre no fuso de Brasília (America/Sao_Paulo).
- Medicamento: texto livre com lista de sugestões (insulinas e antidiabéticos orais comuns).
- Faixas guardadas como 4 limites (padrão 54 / 70 / 180 / 250 mg/dL): abaixo de 54 é hipoglicemia grave; de 54 a 69, hipoglicemia; de 70 a 180, na meta; de 181 a 250, hiperglicemia; acima de 250, hiperglicemia grave.
- Cache Components do Next.js 16 desligado: todas as telas dependem do usuário logado e são montadas na hora do acesso. Ligado, ele entrava em conflito com a validação do login feita pelo Supabase.
- Código em `C:\dev\app-glicemia` (fora do OneDrive), versionado no GitHub e publicado automaticamente pela Vercel a cada envio.

### Fora do escopo (ideias futuras)
- Lembretes / notificações de horário de medição.

### Explicitamente fora do escopo
- Integração com sensores contínuos (CGM) e importação de arquivos.
- Contagem de carboidratos / registro de refeições estruturado.
- Conversão para mmol/L.
- Múltiplos pacientes por conta.
- Modo offline / PWA.
- Notificações a familiares em caso de valores graves.
- Múltiplos idiomas.

## 10. Glossário
- **Glicemia:** concentração de glicose (açúcar) no sangue, medida em mg/dL.
- **Glicosímetro:** aparelho que mede a glicemia com uma gota de sangue do dedo.
- **Hipoglicemia:** glicemia baixa (< 70 mg/dL). Abaixo de 54 é considerada grave e pode causar desmaio.
- **Hiperglicemia:** glicemia alta (> 180 mg/dL na maioria das metas).
- **Jejum:** medição após pelo menos 8 horas sem comer, normalmente ao acordar.
- **Pós-prandial:** medição feita cerca de 2 horas após uma refeição.
- **Tempo na meta (TIR):** percentual de medições dentro da faixa-alvo. É um indicador muito usado por médicos.
- **Insulina rápida/ultrarrápida:** aplicada nas refeições para cobrir o açúcar da comida.
- **Insulina lenta (basal):** aplicada 1 a 2 vezes por dia para manter o nível de fundo.
- **HbA1c (hemoglobina glicada):** exame de laboratório que reflete a média da glicemia dos últimos ~3 meses.
- **CGM:** monitor contínuo de glicose (sensor colado na pele que mede o tempo todo).
- **Tipo 1 / Tipo 2 / Gestacional:** principais tipos de diabetes (ver seção 2).

## 11. Pontos em aberto
- [x] Escolher a stack de tecnologia: Next.js + Supabase (seção 8).
- [x] Medicamentos: texto livre com lista de sugestões (Fase 1).
- [ ] Definir se o link de compartilhamento terá validade padrão (ex.: 30 dias) ou será permanente até a revogação.
- [x] Termos de Uso e Política de Privacidade: texto-modelo publicado em `/termos` (revisar antes de qualquer uso real).
