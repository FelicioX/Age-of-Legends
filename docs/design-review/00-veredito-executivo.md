# 00 — Veredito Executivo

## Tese central

Age of Legends hoje é uma **fundação técnica e documental competente com um protótipo de loop
idle**, não um jogo. O que existe prova que o time sabe montar um projeto — monorepo, ECS,
pipeline de qualidade, um protótipo jogável que roda no navegador — mas **não prova nada sobre
o jogo**, porque as três coisas que sustentam um RPG/4X live-service por centenas de horas
ainda não existem em forma jogável: **combate com profundidade**, **um mundo persistente com
outros jogadores**, e **a malha de sistemas de meta-progressão que transforma sessões em hábito**.

A distância entre o estado atual e o alvo não é de _polimento_ — é de _escopo_. O protótipo
implementa talvez 5% da superfície de sistemas de um título competitivo do gênero, e os 5%
implementados estão no nível de "maquete funcional", não de "vertical slice de produção".

Isso não é um veredito de fracasso. É o diagnóstico honesto de um projeto que está no **fim da
pré-produção de engenharia** e no **começo da pré-produção de game design**. O caminho à frente
é longo, mas é conhecido e mapeável — e é isso que este documento faz.

## O que já é sólido (crédito onde é devido)

- **Higiene de engenharia acima da média**: monorepo pnpm/turborepo, ECS determinístico, ADRs,
  pipeline de lint/format/test verde, packaging mobile planejado (Capacitor), separação
  client/server/shared/engine. Isso é o esqueleto correto para um live-service.
- **Documentação de visão madura**: a pasta `reference/` já contém teardown de economia,
  combate, progressão, guildas, eventos e retenção. A intenção de design está articulada.
- **Protótipo que comunica o pilar idle**: produção offline, upgrade de edifícios com timer,
  roster de heróis com raridade/classe, e um auto-battler por turnos-de-carga funcional.
  O _loop econômico_ mínimo existe e é legível.

## O que é ilusório (a armadilha do "parece pronto")

- **A estrutura de pastas `client/server/engine/game/shared` está quase vazia de jogo.** Há
  scaffolding compilando (`dist/`), mas o jogo real vive no `playable/` — um protótipo
  vanilla isolado que **não usa** nenhuma dessas camadas. Existe um _cisma_ entre a arquitetura
  documentada e o que efetivamente roda.
- **O "combate" é uma planilha animada.** Duas colunas de cartões com emoji, barra de HP e um
  micro-lunge. Não há personagens, palco, habilidades visíveis, projéteis, timing ou decisão.
  É a representação de um combate, não um combate.
- **Não há mundo, nem outro jogador, nem sessão social.** Tudo é single-player local em
  `localStorage`. O gênero que se quer competir é, na essência, um **jogo social de servidor
  autoritativo**. Sem isso, não há retenção de centenas de horas — há um idle de fim de semana.

## As 6 perguntas críticas, respondidas

### 1. O que falta para isso ser um jogo competitivo?

Em uma frase: **falta o jogo**. Concretamente, faltam os três motores de retenção do gênero e a
camada que os conecta:

- **Motor de combate real** — unidades animadas, habilidades ativas/passivas, formação que
  importa, feedback audiovisual (o "game feel"). É o que o jogador _olha_ e _sente_.
- **Servidor autoritativo + mundo persistente compartilhado** — mapa do reino com outros
  jogadores, guildas reais, PvP, chefes mundiais. É o que dá _propósito social_ e horizonte
  longo.
- **Malha de meta-progressão** — heróis colecionáveis com ascensão, equipamento/craft, pets,
  árvores de pesquisa, temporadas. É o que dá _o que fazer amanhã_.
- **A cola**: LiveOps (eventos rotativos), economia com sinks reais, onboarding tutorado, e
  telemetria para tunar tudo com dados.

### 2. Quais sistemas ainda não existem?

Praticamente todos os de médio/longo prazo. Não existem, hoje, em forma jogável: **equipamento,
craft, inventário, pets/criaturas, árvore de pesquisa, mundo explorável, exploração contínua,
missões diárias/semanais, eventos temporários, guildas, PvP, chefes mundiais, ranking,
temporadas, sistema social/chat, conquistas, monetização, loja, gacha/invocação, tutorial
inteligente, e áudio.** O combate e a coleção de heróis existem apenas como esboço. Ver a
matriz completa em [07 — Gap Competitivo](07-gap-competitivo.md).

### 3. O que está incompleto?

- **Coleção de heróis**: há roster, raridade e classe, mas sem ascensão/estrelas, sem
  habilidades, sem fragmentos, sem invocação, sem sinergias de facção reais.
- **Progressão**: há nível de herói e de edifício, mas sem os _múltiplos trilhos_ que sustentam
  o gênero (equipamento, pesquisa, talentos, pets, VIP, temporada).
- **Combate**: simulação de dano existe, mas sem habilidades, sem energia/ultimate, sem
  posicionamento, sem visual de batalha.
- **Cidade**: 9 edifícios com upgrade, mas sem filas de construção, sem desbloqueios
  encadeados significativos, sem função de cada prédio no metagame.

### 4. O que precisa ser refeito?

- **A camada de renderização e o "onde o jogo roda".** É preciso decidir e unificar: ou o jogo
  de produção vive nas camadas `client/engine` (recomendado — ver
  [01](01-auditoria-critica.md)), ou o `playable/` vira o cliente. Manter dois mundos paralelos
  é dívida garantida.
- **O combate inteiro** — de cartões-planilha para uma cena de batalha renderizada com
  unidades e habilidades. Não é evolução do atual; é substituição.
- **O modelo de persistência** — de `localStorage` single-player para **estado autoritativo no
  servidor**. Todo o resto (PvP, guilda, ranking, LiveOps, monetização) depende disso.

### 5. O que não atende aos padrões atuais do mercado mobile?

- **Ausência de "game feel"**: sem áudio, sem partículas, sem juice, sem haptics. O padrão
  atual é feedback multissensorial em cada toque.
- **Ausência de FTUE tutorada**: o jogador cai numa tela sem mão guiada. O padrão é um
  onboarding scriptado que entrega a primeira vitória e o primeiro herói raro em <90 segundos.
- **Ausência de camada social e competitiva**: o padrão do gênero é servidor com milhares de
  jogadores, guildas e rankings. Um single-player local não compete.
- **Ausência de monetização ética estruturada**: sem loja, passes, ofertas ou economia dupla
  (soft/hard currency) desenhada. Sem isso não há serviço vivo.
- **Ausência de mundo persistente**: o pilar 4X (expandir, explorar, exterminar, explorar) não
  tem substrato.

### 6. O que impediria um jogador de permanecer por centenas de horas?

Tudo que dá horizonte longo está ausente. Hoje o jogador esgota o conteúdo em **minutos**:
sobe alguns edifícios, ganha algumas batalhas resolvidas por comparação de poder, e não há
mais nada — nem teto de progressão distante, nem outro jogador para superar, nem evento
amanhã, nem guilda esperando contribuição, nem coleção para completar, nem temporada para
subir. **Retenção de centenas de horas é uma função de (a) profundidade de sistemas
entrelaçados, (b) pressão social, e (c) novidade operada (LiveOps).** O projeto tem zero dos
três em forma jogável.

## Recomendação de direção

1. **Pare de expandir a documentação e a arquitetura no vácuo.** O gargalo não é planejamento —
   é ter _o jogo rodando_. O próximo marco é um **vertical slice jogável** que prove o game
   feel do combate e o loop de sessão, não mais scaffolding.
2. **Unifique o cliente.** Escolha uma stack de render de produção (recomendo PixiJS, já
   previsto no ADR-0006) e migre o protótipo para ela, ou evolua o `playable/` com disciplina
   de produção. Um só mundo.
3. **Combata primeiro.** O combate é o coração emocional e a coisa que mais muda a percepção de
   "isto é um jogo". É o primeiro grande investimento — detalhado em
   [03 — Sistemas Núcleo](03-sistemas-nucleo.md).
4. **Servidor autoritativo cedo.** Sem ele, metade dos sistemas não pode nem começar. Ele é
   dependência de fase, não de polimento.
5. **Execute pelo roadmap de 6 fases** ([08](08-roadmap-6-fases.md)), cada fase encerrada por um
   _marco jogável testável_, não por documentação.

O resto desta revisão detalha cada sistema faltante no nível de especificação de produção e
amarra tudo em um plano executável.
