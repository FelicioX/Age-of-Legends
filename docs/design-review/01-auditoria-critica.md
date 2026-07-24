# 01 — Auditoria Crítica do Estado Atual

Auditoria honesta do que existe no repositório em julho/2026, separando o que é **ativo de
produção**, o que é **maquete**, e o que é **dívida**.

## 1. Camadas do repositório

| Camada                          | Estado                                           | Veredito                                                                |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `playable/` (protótipo vanilla) | ~2.500 linhas JS/HTML/CSS, roda no navegador     | **Maquete jogável.** É o único "jogo" real, mas isolado da arquitetura. |
| `engine/` (ECS)                 | Compila, poucas classes (world/system/component) | **Esqueleto.** Correto, porém sem gameplay.                             |
| `game/` (componentes/sistemas)  | Compila, movimento básico                        | **Esqueleto.**                                                          |
| `client/` (React+Vite)          | App shell TSX mínimo                             | **Placeholder.** Não é o cliente do jogo.                               |
| `server/`                       | Config + runtime stub                            | **Placeholder.** Sem lógica autoritativa.                               |
| `shared/`                       | Constantes/eventos                               | **Útil, embrionário.**                                                  |
| `docs/`, `reference/`           | Extensos, maduros                                | **Ativo real.** Visão bem articulada.                                   |

**Problema estrutural nº 1 — o cisma.** O jogo que roda (`playable/`) e a arquitetura que é
documentada (`client/engine/server`) são dois universos que não se tocam. Todo esforço colocado
em um não beneficia o outro. Isso precisa ser resolvido _antes_ de escalar sistemas, ou cada
sistema será construído duas vezes.

## 2. O protótipo jogável, sistema a sistema

### 2.1 Cidade / base — `render.js`, `data.js`

- **Existe**: 9 edifícios em grid isométrico desenhado em canvas, upgrade com custo e timer,
  produção por segundo, produção offline, seleção por toque.
- **Falta**: filas de construção, função estratégica de cada prédio no metagame, desbloqueios
  encadeados, muralhas/defesa, decoração funcional, expansão de território.
- **Qualidade**: arte procedural em canvas é charmosa mas "programmer art". Não escala para o
  padrão visual do gênero (cenas ricas, animações ambientais, iluminação).

### 2.2 Heróis — `data.js`, `game.js`

- **Existe**: 12 heróis, 4 raridades, 5 classes com papéis (tank/dps/mage/healer/support),
  stats derivados por nível, recrutamento por gemas, party de até 5, level-up por recurso/XP.
- **Falta**: habilidades (ativa/passiva/ultimate), ascensão por estrelas, fragmentos, invocação
  (gacha), sinergias de facção, equipamento por herói, história/personalidade, arte/animação.
- **Veredito**: é uma _lista de personagens_, não um _sistema de coleção_. Falta o vício do
  "quero completar / quero evoluir aquele lendário".

### 2.3 Combate — `game.js` (`battleTick`)

- **Existe**: auto-battler por _charge/ATB_, papéis atuam diferente (mago em área, healer cura
  o mais ferido, dano com crit e variância), HP bars, dano flutuante, banner de vitória.
- **Falta**: **tudo que é visual e tático** — palco de batalha, unidades desenhadas/animadas,
  habilidades com efeito, energia/ultimate, posicionamento, contadores de facção, velocidade
  2x/skip, auto vs manual. E do lado de sistemas: recompensas encadeadas, chefe de estágio,
  estrelas de desempenho, replay.
- **Veredito**: a _lógica_ é uma base decente para um autobattler; a _apresentação_ está a um
  oceano do padrão. É o item de maior alavancagem do projeto.

### 2.4 Campanha — `game.js`

- **Existe**: estágios sequenciais, poder inimigo escalando, recompensa por estágio, gasto de
  stamina.
- **Falta**: mapa de campanha, capítulos com narrativa, chefes, dificuldades (normal/elite/
  pesadelo), idle rewards por estágio ("sweep"), drops de fragmentos/equipamento.

### 2.5 Economia — `data.js`

- **Existe**: 5 recursos + gemas, custos exponenciais de upgrade, produção por prédio.
- **Falta**: **sinks** de verdade, moeda dupla (soft/hard) desenhada, fontes/ralos balanceados,
  inflação controlada, câmbio, mercado, economia de guilda. Ver [05](05-economia-e-meta.md).

### 2.6 Persistência / meta

- **Existe**: save/load em `localStorage`, seed determinístico.
- **Falta**: conta, servidor autoritativo, anti-cheat, sincronização multi-device, temporadas.
- **Veredito**: aceitável para protótipo, **bloqueante** para o produto. Todo sistema social
  depende de servidor.

## 3. Qualidade técnica transversal (o que falta para "padrão de mercado")

| Dimensão    | Estado atual         | Padrão de mercado                                               |
| ----------- | -------------------- | --------------------------------------------------------------- |
| Render      | Canvas 2D procedural | Engine 2D/3D com atlas, spine/esqueletos, partículas            |
| Áudio       | **Inexistente**      | Música adaptativa + SFX em cada interação + haptics             |
| Game feel   | Micro-animações CSS  | Juice: screen shake, hitstop, partículas, tween em tudo         |
| Onboarding  | Nenhum               | FTUE scriptada com objetivos e "mão guiada"                     |
| Networking  | Nenhum               | Servidor autoritativo + reconexão + anti-cheat                  |
| Telemetria  | Nenhuma              | Funil, coortes, economia instrumentada (o ref. usa Crashlytics) |
| Localização | 1 idioma (EN)        | Ref. empacota **24 idiomas**                                    |
| LiveOps     | Nenhum               | Calendário de eventos, config remota, A/B testing               |
| Monetização | Nenhuma              | IAP + passes + ofertas + (opcional) ads mediados                |

## 4. Riscos estruturais a corrigir agora

1. **Dívida de arquitetura dupla** (o cisma) — decidir o cliente único imediatamente.
2. **Otimismo de scaffolding** — pastas vazias dão sensação de progresso que não existe no
   jogo. Medir progresso por _marcos jogáveis_, não por arquivos.
3. **Ausência de vertical slice** — sem uma fatia vertical polida, o time não sabe quanto custa
   "qualidade de mercado" por sistema. A Fase 1 do roadmap corrige isso.
4. **Escopo vs. capacidade** — a lista de sistemas-alvo é de estúdio médio. Sem priorização
   feroz (o roadmap), o projeto morre de ambição. **Recomendação: nada fora da Fase 1 até a
   Fase 1 estar divertida.**

## 5. Decisão arquitetural recomendada (proposta melhor que o estado atual)

O estado atual mantém dois clientes. Proposta:

- **Cliente único em PixiJS** (ADR-0006 já aponta nessa direção) rodando o jogo de produção,
  reaproveitando o `engine/` ECS para a simulação determinística que **roda igual no cliente e
  no servidor** (predição no cliente, autoridade no servidor).
- **`playable/` é rebaixado a "sandbox de design"** — usado para prototipar mecânicas rápido,
  nunca como base do produto. Isso preserva o valor do protótipo sem perpetuar o cisma.
- **Servidor Node autoritativo** com a mesma simulação ECS compartilhada (`shared/`+`engine/`),
  Postgres para estado durável, Redis para estado quente/salas. Combate resolvido no servidor
  (determinístico por seed) e apenas _reproduzido_ com juice no cliente — isso mata cheating de
  PvP e permite replays.

Essa é a espinha que sustenta PvP, guildas, ranking, chefes mundiais e LiveOps. É investimento
de fundação, não de fase tardia.
