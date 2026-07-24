# 04 — Sistemas de Mundo e Social

A camada que transforma um RPG single-player em um serviço social com horizonte de anos.
**Todos dependem de servidor autoritativo** (ver [01, §5](01-auditoria-critica.md)).

---

## 4.1 Mundo Vivo Explorável

**Objetivo.** Dar um espaço compartilhado e persistente onde jogadores coexistem, competem e
cooperam — o palco do pilar 4X e da vida social.

**Mecânica.** Mapa-mundo em grid/hex com: cidades de jogadores, territórios de guilda, nós de
recurso, masmorras/pontos de interesse, chefes mundiais, e zonas de evento. Ações no mapa:
mover exército, coletar recurso, atacar/ajudar, ocupar território, explorar névoa de guerra.
Estado do mundo evolui em tempo real no servidor (fog, ocupações, eventos).

**Fluxo.** Jogador vê sua cidade no mundo → explora arredores → coleta/limpa nós → encontra
outros jogadores e a guilda → participa de objetivos coletivos (ocupar, defender, derrubar
chefe). O mundo dá "para onde ir" além das telas de menu.

**Interface.** Vista de mapa com zoom (cidade↔região↔mundo), camadas (recurso/guilda/evento),
minimapa, marcadores de guilda e alertas (ataque recebido, evento começando).

**Integração.** Une cidade (origem), exércitos (heróis/tropas), guilda (território), PvP
(ataques), chefes mundiais, eventos e economia (recursos do mapa). É o tecido conjuntivo do
metagame social.

**Retenção.** Pertencimento + territorialidade + eventos ao vivo. "O que está acontecendo no
mundo agora" é um gancho diário poderoso. Ausência total hoje.

---

## 4.2 Exploração Contínua

**Objetivo.** Fornecer um fluxo constante de descobertas e recompensas de baixa fricção que
premeiam curiosidade e presença.

**Mecânica.** Névoa de guerra que se abre com exploração; nós que reaparecem (recursos, baús,
encontros); masmorras roguelite curtas; missões de exploração ("scout") em idle; eventos
aleatórios no mapa. Camada de raridade nas descobertas (comum→lendário).

**Fluxo.** Envia batedores/heróis para explorar (idle) → recebe descobertas ao voltar → decide
o que investigar a fundo (masmorra/combate). Loop de "abrir o mapa" complementa o loop de
"subir números".

**Interface.** Overlay de exploração no mapa, fila de expedições com timers, log de
descobertas, indicadores de "algo novo por aqui".

**Integração.** Alimenta economia (drops), coleção (fragmentos raros), campanha (masmorras),
LiveOps (eventos de exploração).

**Retenção.** Novidade e surpresa (recompensa variável ética). Dá textura ao mundo e razões
para voltar além do combate.

---

## 4.3 Campanha (PvE narrativo)

**Objetivo.** Ser a espinha de conteúdo solo: ensina sistemas, entrega narrativa, e é a fonte
principal de progressão inicial e de idle rewards.

**Mecânica.** Capítulos → estágios → chefes de capítulo. Dificuldades escalonadas (Normal/
Elite/Pesadelo) que reciclam conteúdo com novos drops. **Idle/AFK rewards**: o último estágio
limpo gera recursos/XP passivamente; **sweep** (limpar instantâneo com estrelas) remove grind.
Drops direcionados (fragmentos de herói X no estágio Y) para dar propósito.

**Fluxo.** Avança estágios → topa numa parede de poder → volta a evoluir heróis/equipamento →
retorna → derruba o chefe → destrava capítulo e novos idle rewards. Elite/Pesadelo estendem a
vida do mesmo conteúdo.

**Interface.** Mapa de campanha ilustrado por capítulo, tela de estágio com recompensas e drops
previstos, painel de idle rewards com "coletar", botões de sweep/auto.

**Integração.** Fonte de fragmentos (coleção), equipamento (drops), recursos (economia); usa
combate e formação; gate por nível de cidade.

**Retenção.** Loop de minutos/horas + idle. É o "trabalho constante" que dá base à progressão e
o motor de retorno diário (coletar idle).

**Gap atual.** Existe versão mínima (estágios+poder+recompensa). Faltam: capítulos/narrativa,
chefes, dificuldades, idle rewards, sweep, drops direcionados.

---

## 4.4 PvP

**Objetivo.** Fornecer competição direta e um metagame de formações — a fonte de engajamento de
longo prazo mais barata de produzir (jogadores geram conteúdo entre si).

**Mecânica (camadas).**

- **Arena assíncrona**: ataca a _formação de defesa_ de outro jogador (combate determinístico no
  servidor); ligas/ranking com reset por temporada.
- **PvP de mundo**: ataques no mapa (com janelas de proteção para novatos e escudos).
- **Guerra de guilda** (ver 4.6).
- Matchmaking por poder/liga; proteção de novatos; recompensas por rank e por temporada.

**Fluxo.** Monta defesa → ataca alvos viáveis → sobe de liga → ajusta formação conforme o
metagame → busca heróis que contrem os tops. Reset de temporada renova a corrida.

**Interface.** Lista de oponentes (poder/liga), tela de resultado com replay, ladder com
recompensas por faixa, histórico de ataques recebidos (defesa/vingança).

**Integração.** Consome heróis/formação/equipamento; gera demanda por coleção (contras);
alimenta ranking, temporadas e economia (recompensas). Determinismo do combate é anti-cheat.

**Retenção.** Competição + status social + metagame infinito. Ligas e resets dão corrida
recorrente. Ausência total hoje.

---

## 4.5 Chefes Mundiais (PvE cooperativo)

**Objetivo.** Criar objetivos coletivos de alto impacto que unem servidor/guilda e entregam
recompensas aspiracionais.

**Mecânica.** Chefe com barra de HP compartilhada; jogadores contribuem dano em tentativas
(com energia própria); ranking de contribuição com recompensas por faixa; janelas de tempo
(evento). Mecânicas de fraqueza (facção/elemento) premiam coleção.

**Fluxo.** Chefe aparece (agendado/mundo) → jogador otimiza time anti-chefe → contribui dano →
sobe no ranking de contribuição → coleta recompensas → guilda celebra o abate coletivo.

**Interface.** Tela do chefe com HP global, ranking de dano ao vivo, timer, e recompensas por
faixa; alerta quando o chefe surge.

**Integração.** Usa combate/formação; conecta guilda e servidor; fonte de itens endgame e
prestígio; gancho de LiveOps (chefes temáticos por temporada).

**Retenção.** Cooperação + competição de contribuição + recompensa aspiracional. Evento
recorrente que pauta o calendário semanal.

---

## 4.6 Guildas

**Objetivo.** Ancorar o jogador socialmente. Interdependência positiva é o maior multiplicador
de retenção de longo prazo do gênero (jogadores em guilda ativa retêm muito mais).

**Mecânica.** Entrar/criar guilda; **doações/tecnologia de guilda** (buffs coletivos);
**ajuda** (acelerar construções de colegas); **guerra de guilda** (batalhas territoriais
agendadas); **chefe de guilda**; loja de guilda (moeda de contribuição); chat; cargos e
gerência. Objetivos semanais coletivos.

**Fluxo.** Entra na guilda → doa/ajuda diariamente (dailies sociais) → participa da guerra
agendada → gasta moeda de guilda na loja → sobe a tecnologia coletiva. Compromissos sociais
criam obrigação gentil de retorno.

**Interface.** Hub de guilda (membros, tecnologia, loja, chat, guerra), calendário de eventos
de guilda, painel de contribuição, e notificações de guerra/ajuda.

**Integração.** Toca quase tudo: cidade (ajuda), combate (guerra/chefe), economia (loja/moeda),
mundo (território), LiveOps (eventos de guilda), social (chat).

**Retenção.** Pertencimento + compromisso + objetivos coletivos. É o pilar que segura o jogador
mesmo quando a progressão individual desacelera. Ausência total hoje.

---

## 4.7 Missões e Campanha de Objetivos

**Objetivo.** Guiar o jogador com metas claras de curto/médio/longo prazo e entregar
recompensas frequentes que estruturam a sessão.

**Mecânica.**

- **Diárias** (reset 24h): 5–8 tarefas simples → baú diário ao completar X.
- **Semanais**: metas maiores → baú semanal.
- **Missões de crescimento** (growth funnel): checklist de longo prazo que puxa o jogador por
  todos os sistemas (ex.: "leve um herói a 5★", "chegue ao capítulo 8").
- **Conquistas** (permanentes): marcos com recompensa única. Ver [05](05-economia-e-meta.md).
- **Passe/temporada**: trilha de recompensas por atividade. Ver [05](05-economia-e-meta.md).

**Fluxo.** Abre o jogo → vê dailies → cumpre no fluxo natural de jogo → coleta baús → segue o
funil de crescimento para o próximo grande objetivo. Sempre há "o que fazer agora".

**Interface.** Painel de missões com abas (diária/semanal/crescimento/evento), barras de
progresso, badges de "pronto para coletar", e um indicador global de tarefas pendentes.

**Integração.** Sobreposto a todos os sistemas (missões apontam para eles); casado com economia
(fontes controladas) e onboarding (as primeiras missões são o tutorial estendido).

**Retenção.** Estrutura a sessão, garante "vitórias" frequentes, e conduz o jogador pelo funil.
Dailies são o hábito diário nº 1. Ausência quase total hoje (só há estágios de campanha).
