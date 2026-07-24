# 06 — UX, Onboarding, Feedback e Cadência de Conteúdo

A camada de _apresentação e sensação_ que faz um jogo parecer "de mercado" — e o onboarding que
converte instalações em jogadores retidos.

---

## 6.1 Interface Moderna

**Objetivo.** Uma UI que comunique riqueza sem sobrecarregar, guie a atenção, e escale para
dezenas de sistemas sem virar um labirinto.

**Mecânica/Princípios.**

- **Home como hub**: cidade ao centro, HUD de recursos no topo, navegação por abas embaixo,
  e "ilhas" de acesso rápido (missões, eventos, loja, guilda) com badges.
- **Badges e "next best action"**: o jogo sempre sinaliza o próximo passo com valor (ponto
  vermelho + prioridade), reduzindo paralisia.
- **Hierarquia visual**: raridade por cor consistente, tipografia clara, ícones legíveis a
  qualquer densidade, safe areas de mobile.
- **Motion design**: transições suaves, telas que "entram", nada abrupto.
- **Acessibilidade**: escala de fonte, daltonismo (não só cor para informação), toque
  confortável (targets ≥44px), modo canhoto.

**Fluxo.** O jogador nunca se pergunta "o que faço agora?": badges e o painel de missões
respondem. Navegação de no máximo 2 toques até qualquer sistema.

**Integração.** A UI é a superfície de todos os sistemas; o sistema de badges depende de
missões/eventos/economia.

**Retenção.** Baixa fricção + clareza = sessões fluidas e menos churn por confusão. Um "next
best action" bem feito aumenta profundidade de sessão.

**Gap atual.** Protótipo tem HUD e navegação mínimos, sem badges, sem motion design, sem
acessibilidade. Serve para maquete; não para produto.

---

## 6.2 Tutoriais Inteligentes (FTUE)

**Objetivo.** Levar o jogador do primeiro toque à primeira vitória e ao primeiro herói raro em
<90 segundos, ensinando por ação, não por texto — o ponto de maior ROI de retenção.

**Mecânica.**

- **Combate scriptado imperdível** logo na abertura (dopamina imediata).
- **Mão guiada** (foco + gesto) que ensina um sistema por vez, no fluxo real.
- **Recompensas de onboarding**: herói raro grátis, recursos iniciais, primeiras evoluções.
- **Tutorial contextual**: cada sistema novo se apresenta quando é destravado, não tudo de uma
  vez.
- **Gates de complexidade**: sistemas avançados (PvP, guilda, equipamento) revelados
  progressivamente por nível de cidade.
- **Skip inteligente** para jogadores veteranos, sem punir novatos.

**Fluxo.** Abertura → luta scriptada → ganha herói → primeira construção → primeira coleta idle →
primeira missão diária → gancho para amanhã. Cada passo entrega uma vitória.

**Interface.** Overlays de foco, setas/gestos, diálogos curtos de personagem (voz do mundo), e
uma checklist de "primeiros passos" com recompensas.

**Integração.** É a costura inicial de todos os sistemas + missões de crescimento (o tutorial
_vira_ o funil de missões).

**Retenção.** Define D1 (retenção dia 1). É onde a maioria dos jogadores é ganha ou perdida.
Ausência total hoje — o maior risco de retenção de curto prazo.

---

## 6.3 Feedback Visual e Sonoro de Alta Qualidade ("game feel")

**Objetivo.** Fazer cada interação _sentir_ bem — a diferença tátil entre um protótipo e um
produto de mercado.

**Mecânica.**

- **Visual**: partículas, screen shake calibrado, hitstop em golpes fortes, flashes de crit,
  "chuva" de recompensa, tweens em cada transição, telegrafia de ultimates.
- **Áudio**: música adaptativa por contexto (cidade calma, batalha tensa, vitória), SFX em cada
  toque/acerto/coleta, stingers de vitória/level-up, mixagem por camadas.
- **Haptics**: vibração sutil em crits, level-ups e confirmações (mobile).
- **Recompensa multissensorial**: abrir baú, evoluir herói e vencer batalha devem ser
  _eventos_ audiovisuais, não mudanças silenciosas de número.

**Fluxo.** Transversal: acompanha toda ação. O jogador _sente_ progresso e impacto, não só lê.

**Integração.** Camada sobre todos os sistemas; o combate é o palco onde mais importa.

**Retenção.** Game feel é o que gera o "só mais uma batalha". É a diferença entre respeitável e
viciante. Ausência quase total hoje (apenas micro-animações CSS, zero áudio).

---

## 6.4 Recompensas Frequentes

**Objetivo.** Manter um fluxo constante de "vitórias" de tamanhos variados que sustentam a
motivação sem inflar a economia.

**Mecânica.** Camadas de recompensa: micro (cada combate), pequena (missão diária), média
(baú semanal/nível), grande (marco/chefe), aspiracional (evento/temporada). Login diário
progressivo. Recompensa variável ética (baús com faixa de raridade e pity). Cada recompensa com
feedback audiovisual (ver 6.3).

**Fluxo.** Toda sessão entrega várias recompensas de tamanhos diferentes; marcos maiores pautam
os retornos de médio prazo. Nunca uma sessão "sem ganho".

**Interface.** Login diário, baús no HUD, animações de coleta, e o painel de missões como
distribuidor central.

**Integração.** Governada pela economia (para não inflar) e pelas missões/eventos (como
distribuidores).

**Retenção.** O reforço positivo constante é o combustível do hábito. Calibragem é chave: muito
pouco desmotiva, muito infla. Ausência estruturada hoje.

---

## 6.5 Conteúdo para Curto, Médio e Longo Prazo

**Objetivo.** Garantir que sempre haja algo a fazer em qualquer horizonte de tempo — a definição
operacional de retenção.

**Mecânica/Mapa de conteúdo.**

- **Curto (sessão/dia)**: dailies, idle rewards, energia, 1–2 upgrades, evento do dia.
- **Médio (semana)**: passe, guerra de guilda, ranking de arena, chefe, missões semanais, marcos
  de progressão.
- **Longo (mês+)**: coleção completa, ascensão máxima, equipamento endgame, pesquisa, temporadas,
  prestígio, ligas altas.
- **Regra**: cada horizonte precisa entregar um "próximo alvo" antes do horizonte menor esvaziar.

**Fluxo.** Jogador casual cumpre o curto; engajado avança no médio; dedicado persegue o longo.
Os três coexistem para atender todos os perfis na mesma base.

**Interface.** Missões/eventos/temporada expõem cada horizonte; o "hub de poder" ([03.4]) mostra
o longo prazo.

**Integração.** É a síntese de todos os sistemas organizados por escala de tempo (mapeia aos
loops de [02](02-teardown-do-genero.md)).

**Retenção.** É _a_ retenção. Hoje o projeto só tem conteúdo de curtíssimo prazo, e raso —
esgota em minutos. Construir os horizontes médio e longo é o trabalho central do roadmap.
