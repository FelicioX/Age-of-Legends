# Age of Legends — Revisão de Direção de Game Design

> Revisão crítica do projeto sob a ótica de um Diretor de Game Design de estúdio AAA
> (padrões de mercado de RPG/4X mobile live-service). O jogo de referência de gênero é
> usado **exclusivamente** como parâmetro de design e engenharia — nenhum código, asset ou
> conteúdo proprietário é copiado. Toda a identidade, nomes, sistemas e conteúdo de
> Age of Legends são originais.

## Contexto da referência de gênero

O título de referência analisado é um RPG/4X mobile live-service global construído em **Unity
(IL2CPP)**, com mediação de anúncios **AppLovin MAX**, telemetria **Firebase Crashlytics** e
**24 idiomas** empacotados — um produto de escala global operado como serviço vivo. Essa é a
régua de escopo, profundidade e qualidade adotada nesta revisão.

## Como ler

Os documentos vão do diagnóstico ao plano de execução. Leia nesta ordem:

| #   | Documento                                                    | O que responde                                                                             |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 00  | [Veredito Executivo](00-veredito-executivo.md)               | O estado real do projeto, as 6 perguntas críticas respondidas, e a tese central.           |
| 01  | [Auditoria Crítica do Estado Atual](01-auditoria-critica.md) | O que existe hoje, o que é sólido, o que é ilusório, o que precisa ser refeito.            |
| 02  | [Teardown do Gênero](02-teardown-do-genero.md)               | A engenharia de retenção do gênero: loops, camadas, arquitetura técnica de referência.     |
| 03  | [Sistemas Núcleo](03-sistemas-nucleo.md)                     | Heróis, combate, formação, progressão, cidade/base — design detalhado.                     |
| 04  | [Sistemas de Mundo e Social](04-sistemas-mundo-social.md)    | Mundo vivo, exploração, campanha, PvE, PvP, chefes mundiais, guildas, missões.             |
| 05  | [Economia e Meta](05-economia-e-meta.md)                     | Equipamento, craft, inventário, pets, economia, monetização, LiveOps, temporadas, eventos. |
| 06  | [UX, Onboarding e Feedback](06-ux-onboarding-feedback.md)    | Interface, tutoriais inteligentes, feedback audiovisual, cadência de conteúdo.             |
| 07  | [Gap Competitivo](07-gap-competitivo.md)                     | Comparação sistema a sistema contra o padrão de mercado.                                   |
| 08  | [Roadmap em 6 Fases](08-roadmap-6-fases.md)                  | MVP → Alpha → Beta → Soft Launch → Global → LiveOps, com esforço, riscos e impacto.        |

## Método de cada ficha de sistema

Cada sistema é descrito com seis facetas fixas:

1. **Objetivo** — que valor entrega ao jogador e ao produto.
2. **Mecânica** — as regras e números centrais.
3. **Fluxo do jogador** — a jornada passo a passo.
4. **Interface** — telas, componentes e navegação.
5. **Integração** — como se conecta aos demais sistemas.
6. **Retenção/engajamento** — por que faz o jogador voltar.

## Convenções

- **Esforço** é estimado em _pessoa-semanas_ (P-sem) para uma equipe pequena
  (1–2 devs, 1 designer, 1 artista part-time), como faixa (otimista–provável).
- **Prioridade** segue MoSCoW: **M** (must), **S** (should), **C** (could), **W** (won't-now).
- Números de balanceamento são pontos de partida para tuning, não valores finais.
