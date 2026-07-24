# 03 — Sistemas Núcleo

Os cinco sistemas que o jogador toca em toda sessão. Se estes não forem excelentes, nenhum
sistema de meta salva o jogo. Cada ficha segue: Objetivo · Mecânica · Fluxo · Interface ·
Integração · Retenção.

---

## 3.1 Heróis Colecionáveis

**Objetivo.** Dar ao jogador uma coleção de personagens memoráveis para desejar, obter, evoluir
e dominar. É o motor primário de colecionismo e de identidade do jogo.

**Mecânica.**

- **Atributos**: cada herói tem classe (papel), facção, raridade base e stats derivados
  (HP, ATK, DEF, SPD, CRIT, etc.).
- **Habilidades**: 1 básica (auto), 1–2 passivas, 1 ultimate (por energia). A identidade do
  herói vive nas habilidades, não nos números.
- **Ascensão por estrelas**: consome duplicatas/fragmentos para subir estrelas (ex.: 1★→6★),
  destravando stats e, em marcos, novos efeitos de habilidade.
- **Nível**: sobe com XP/itens, limitado pelo nível do jogador/cidade (gate de progressão).
- **Fragmentos**: moeda de coleção; heróis obtidos e evoluídos por fragmentos (fonte F2P
  garantida além do gacha).
- **Facção** (ex.: 5 facções): bônus de time por composição + roda de vantagem (A>B>C>A).

**Fluxo do jogador.** Obtém herói (invocação/fragmento/evento) → forma party → percebe que
falta X estrelas ou uma classe → persegue a fonte daquele herói → evolui → reformula a
estratégia. O ciclo "obter→evoluir→completar" nunca termina porque novos heróis entram por
LiveOps.

**Interface.**

- Grade de coleção com filtros (facção/classe/raridade/obtido), badges de "novo" e "pode
  evoluir".
- Tela de detalhe do herói: arte grande animada, bio/personalidade, árvore de habilidades,
  ascensão, equipamento, e um _preview_ de combate da ultimate.
- Indicadores de "próximo marco" sempre visíveis (quanto falta para a próxima estrela).

**Integração.** Alimenta combate (habilidades), formação (papéis/facção), equipamento (slots
por herói), campanha/PvP (poder), guilda (empréstimo de herói/coop), economia (fragmentos como
sink), gacha (fonte), LiveOps (heróis de temporada).

**Retenção.** Colecionismo + progressão composta. O "quero aquele lendário" e o "faltam 40
fragmentos" são ganchos de médio e longo prazo. Heróis com personalidade forte geram apego
emocional — o combustível de anos de retenção.

**Gap atual.** Hoje existe roster+raridade+classe. Faltam: habilidades, estrelas, fragmentos,
facção com sinergia, arte/animação, bio. É preciso **reconstruir** o herói como sistema, não
como registro.

---

## 3.2 Combate

**Objetivo.** Ser o coração emocional e visual do jogo — divertido de assistir, satisfatório de
vencer, profundo de otimizar. É o que converte "app" em "jogo".

**Mecânica (recomendada: autobattler tático com regência de ultimates).**

- **Formação 5v5** (ou até 6) em duas linhas (frente/trás); posição afeta alvo e ameaça.
- **ATB/energia**: unidades enchem energia com o tempo e ao dar/receber dano; ao encher,
  liberam a **ultimate**.
- **Regência manual opcional**: o jogador pode disparar ultimates no timing (janela de
  sinergia), ou deixar em "auto". Isso adiciona _uma_ decisão de maestria sem quebrar o conforto
  AFK — a diferenciação proposta em [02](02-teardown-do-genero.md).
- **Papéis**: tank (ameaça/escudo), dps corpo/à distância, mago (área/dot), healer
  (sustain), suporte (buff/debuff/controle).
- **Sinergia de facção**: composições da mesma facção ganham bônus; roda de vantagem elemental.
- **Estados**: buff/debuff, atordoar, silenciar, sangramento, escudo — o vocabulário tático.

**Fluxo do jogador.** Monta o time → entra no estágio → assiste/rege a batalha → vê ultimates
espetaculares → vence ou perde por margem → ajusta formação/heróis/equipamento → repete. Modos
"auto" e "2x/skip" para grind; modo manual para desafios.

**Interface.**

- **Cena de batalha renderizada**: palco temático, unidades animadas (idle/andar/atacar/
  ultimate/morte), HP/energia bars, números de dano com hierarquia visual (normal/crit/cura),
  telegrafia de ultimates (o "game feel").
- Controles: velocidade (1x/2x), auto on/off, botões de ultimate quando em manual, retirar.
- Tela de resultado: estrelas de desempenho, recompensas com animação de "chuva de itens",
  botões "repetir/continuar/sweep".

**Integração.** Consome heróis+equipamento+pets; usado por campanha, PvP, chefes, eventos,
guerra de guilda. A **simulação é determinística** (mesmo seed → mesmo resultado) para rodar no
servidor e permitir replays/anti-cheat.

**Retenção.** Loop de segundos. É o feedback imediato que dá prazer a cada sessão e o palco onde
toda a progressão "aparece". Sem um combate que dá gosto de ver, nada mais importa.

**Gap atual.** A lógica ATB existe; a **apresentação e a profundidade tática não**. Este é o
item nº 1 de alavancagem: substituir cartões-planilha por cena de batalha com habilidades.
Especificação de produção detalhada é o alvo da Fase 1.

---

## 3.3 Formação Estratégica de Equipes

**Objetivo.** Transformar a coleção em expressão estratégica: _quem_ e _onde_ posicionar, e
_quais_ sinergias ativar. É o "puzzle" entre coletar e combater.

**Mecânica.**

- Slots de posição (frente/trás) que afetam ameaça e alcance.
- **Sinergias**: por facção (3/5 iguais), por classe (2 tanks = muralha), por herói específico
  (duplas com bônus narrativo).
- **Contadores**: roda elemental/facção + composições especializadas (anti-tank, burst, controle).
- **Múltiplas formações salvas** (PvE, PvP defesa, PvP ataque, chefe) para troca rápida.

**Fluxo.** Vê o inimigo/objetivo → escolhe heróis e posições → confere bônus de sinergia
destacados → testa → itera. Em PvP, cria uma formação de defesa e várias de ataque.

**Interface.** Tabuleiro 2 linhas com drag-and-drop, painel lateral com sinergias ativas
(destacadas em verde), preview de poder total e de contadores contra o alvo, presets salvos.

**Integração.** Ponte entre heróis, combate, PvP e chefes. Sinergias criam demanda por heróis
específicos → alimenta coleção e gacha.

**Retenção.** Profundidade estratégica sem sobrecarga. Cada herói novo re-abre o puzzle. Em PvP,
o metagame de formações é uma fonte inesgotável de engajamento entre jogadores.

**Gap atual.** Existe "party de 5" sem posição, sem sinergia, sem presets. Precisa virar sistema.

---

## 3.4 Progressão Profunda (múltiplos trilhos)

**Objetivo.** Garantir que sempre haja "algo para melhorar", distribuído em trilhos que maturam
em ritmos diferentes, sustentando do curto ao longuíssimo prazo.

**Mecânica (trilhos recomendados).**

1. **Nível de herói** (XP/itens) — rápido, constante.
2. **Estrelas/ascensão** (fragmentos) — médio, marcos memoráveis.
3. **Habilidades** (livros de skill) — médio.
4. **Equipamento** (drops/craft/aprimoramento) — médio/longo. Ver [05](05-economia-e-meta.md).
5. **Pesquisa/Academia** (bônus globais de reino) — longo, idle.
6. **Pets/criaturas** (bônus e habilidades) — longo. Ver [05](05-economia-e-meta.md).
7. **Nível de cidade/reino** — gate mestre que destrava os demais.
8. **Talentos/prestígio de conta** — endgame.

- **Gate mestre**: o nível da Cidade limita os demais, criando o pulso central de progressão.

**Fluxo.** A cada sessão o jogador avança 1–2 trilhos (o que estiver "barato" naquele momento),
sente ganho, e mira o próximo marco. Os trilhos lentos (pesquisa/pets) rodam em idle no fundo.

**Interface.** Um "hub de poder" que mostra todos os trilhos, o ganho de poder de cada próximo
passo, e recomenda "o upgrade mais eficiente agora" (reduz paralisia de decisão).

**Integração.** Todo trilho consome economia (sinks) e aumenta poder (combate/PvP/chefes). O
gate de cidade conecta o pilar 4X (base) ao RPG (heróis).

**Retenção.** Progressão composta = o motor de médio/longo prazo. Múltiplos trilhos evitam
"parede" (quando um trava, outro avança) e a fadiga de grind de trilho único.

**Gap atual.** Só existem trilhos 1 (nível de herói) e 7 (nível de prédio). Faltam 6 dos 8.

---

## 3.5 Construção e Evolução da Cidade/Base

**Objetivo.** Dar ao jogador um lar persistente para investir, um horizonte longo de construção,
e o substrato do pilar 4X. A ausência vira anticipação (timers) e o retorno vira ação
satisfatória.

**Mecânica.**

- **Edifícios funcionais** (não só produção): Castelo (gate mestre), produtores de recurso,
  Quartel (capacidade/poder de tropa), Altar de Heróis (ascensão), Academia (pesquisa),
  Portal de Invocação (gacha), Mercado (câmbio/loja), Muralha+Defesas (PvP), Salão da Guilda,
  Forja (equipamento/craft), Santuário de Pets.
- **Filas de construção** com timers (aceleráveis por item/hard currency — conveniência, não
  poder).
- **Desbloqueios encadeados**: subir o Castelo destrava tiers e novos edifícios (dá "próximo
  objetivo" claro).
- **Expansão de território**: limpar áreas ao redor destrava novos lotes (micro-4X).

**Fluxo.** Coleta idle → inicia construção/pesquisa (timer) → sai → volta para coletar e
reencaminhar filas. O ciclo "iniciar antes de sair, colher ao voltar" é o hábito diário.

**Interface.** Mapa isométrico da cidade com prédios tocáveis, badges de "pronto/pode evoluir",
fila de construção visível, e uma "lista de tarefas do reino" que aponta o próximo passo ótimo.

**Integração.** É o hub que conecta todos os sistemas (cada prédio é a porta de um sistema).
O gate de cidade rege a progressão global; as defesas conectam a base ao PvP (a tese de
diferenciação: base que importa na guerra).

**Retenção.** Ownership + horizonte longo + hábito de retorno (timers). É o pilar 4X que
complementa o RPG e dobra a superfície de progressão.

**Gap atual.** Existe upgrade+produção+idle. Faltam: filas, função metagame de cada prédio,
desbloqueios encadeados significativos, defesas, expansão. A base existe como cenário; precisa
virar sistema de decisões.
