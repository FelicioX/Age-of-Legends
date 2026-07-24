# 05 — Economia, Progressão de Itens e Meta

A camada que dá profundidade de longo prazo e sustenta o modelo de serviço vivo — sempre com
**monetização ética** (dinheiro compra tempo/conveniência/cosmético, nunca teto de poder).

---

## 5.1 Equipamento

**Objetivo.** Um trilho de progressão de médio/longo prazo por herói, com decisões de build e
caça a drops.

**Mecânica.** Slots por herói (arma, armadura, elmo, botas, acessórios); raridade (comum→
lendário→mítico); **atributos principais + secundários** (aleatórios, gerando busca por "a peça
perfeita"); **aprimoramento** (+1…+15) com custo e risco/segurança; **conjuntos** (bônus por 2/4
peças) que reforçam builds/papéis. Fontes: drops de campanha/masmorra, craft, loja, eventos.

**Fluxo.** Equipa o melhor disponível → percebe faltar um conjunto/atributo → farma o local do
drop ou crafta → aprimora → re-rola secundários no endgame. Loop de otimização perpétuo.

**Interface.** Tela de equipamento do herói com slots, comparação lado a lado (delta de stats),
filtros de inventário, e preview de bônus de conjunto.

**Integração.** Consome economia (sinks fortes), alimenta combate/PvP/chefes, usa craft e
inventário, é fonte de recompensa de quase todo sistema.

**Retenção.** Progressão composta + recompensa variável (atributos aleatórios) + builds. Um dos
trilhos endgame mais duradouros. Ausência total hoje.

---

## 5.2 Craft e Forja

**Objetivo.** Dar agência sobre a progressão de itens (não depender só de sorte de drop) e criar
sinks de recurso.

**Mecânica.** Receitas destravadas por progressão; consome materiais (drops + recursos da
cidade) para criar/aprimorar equipamento, itens de ascensão, consumíveis. **Fusão/reforja**:
combinar itens menores em maiores; re-rolar atributos. Forja como edifício da cidade.

**Fluxo.** Junta materiais (campanha/mundo/eventos) → craft do item-alvo → aprimora/reforja →
recicla itens obsoletos (sink + devolução parcial). Fecha o ciclo de itens.

**Interface.** Tela da Forja com receitas, materiais necessários (com atalho "onde farmar"),
fila de craft, e reciclagem em lote.

**Integração.** Ponte entre economia, equipamento, campanha (materiais) e cidade (edifício).

**Retenção.** Agência + sinks saudáveis + metas de coleta de materiais. Reduz frustração de RNG
puro. Ausência total hoje.

---

## 5.3 Inventário

**Objetivo.** Organizar tudo que o jogador acumula, com clareza e baixa fricção.

**Mecânica.** Categorias (equipamento, materiais, fragmentos, consumíveis, baús, moedas);
empilhamento; ordenação/filtros; ações em massa (usar/vender/reciclar); baús que abrem com
animação e escolha.

**Fluxo.** Recebe itens → inventário organiza → usa consumíveis/abre baús no momento certo →
recicla o obsoleto. Deve ser _invisível quando funciona_ e poderoso quando necessário.

**Interface.** Grade com abas, busca, filtros, seleção múltipla, e indicadores de "novo/usável".

**Integração.** Substrato de equipamento, craft, economia, recompensas de todos os sistemas.

**Retenção.** Indireta: reduz fricção e sustenta a sensação de acúmulo ("meu tesouro"). Ausência
total hoje.

---

## 5.4 Pets / Criaturas

**Objetivo.** Um eixo de coleção e progressão paralelo aos heróis, com identidade própria e
bônus estratégicos.

**Mecânica.** Criaturas colecionáveis que dão bônus passivos (ao herói/time/reino) e/ou uma
habilidade em combate; evolução própria (nível/estrelas/fragmentos); vínculo pet↔herói com
sinergia; obtenção por invocação/eventos/exploração.

**Fluxo.** Obtém pet → vincula ao herói que combina → evolui → destrava habilidade/bônus →
persegue novos pets para novas builds. Segundo motor de colecionismo.

**Interface.** Santuário de pets (coleção, evolução, vínculo), preview do bônus em combate.

**Integração.** Reforça heróis/combate/formação; novo eixo de gacha/eventos; edifício
(Santuário) na cidade.

**Retenção.** Duplica a superfície de coleção e progressão com custo incremental. Fonte de
novidade em LiveOps (pets temáticos). Ausência total hoje.

---

## 5.5 Economia (fontes, ralos, moedas)

**Objetivo.** Manter o jogo desafiador e recompensador ao longo de centenas de horas, sem
inflação nem paredes injustas, com monetização saudável.

**Mecânica.**

- **Moeda dupla**: _soft currency_ (ouro/recursos — abundante, sinks operacionais) e _hard
  currency_ (gemas — escassa, premium, ganhável em F2P e comprável). Nunca misturar poder direto
  com hard currency.
- **Moedas especializadas**: guilda, arena, evento, loja (evitam conversão cruzada e controlam
  cada economia).
- **Fontes** balanceadas (idle, campanha, missões, eventos) e **ralos** deliberados (upgrades,
  craft, aprimoramento, reroll, aceleração de timer).
- **Energia/stamina**: limita o ritmo de PvE, cria retorno diário e ponto de monetização suave.
- **Instrumentação**: toda fonte/ralo logada para tuning por dados (a referência usa telemetria
  de estabilidade; produto exige analytics de economia).

**Fluxo.** Ganha por atividade → gasta em progressão → sente escassez calibrada → decide entre
esperar (idle), jogar mais (atividade) ou pagar (conveniência). Nunca "pagar para não perder".

**Interface.** HUD de moedas sempre visível, telas de custo com "quanto falta" e atalho para a
fonte, e transparência total de preços/odds.

**Integração.** Substrato de todos os sistemas. O design de sinks é o que impede a inflação que
mata economias de live-service.

**Retenção.** Escassez calibrada mantém as decisões significativas. Economia saudável é
pré-condição de retenção longa e de monetização ética.

**Gap atual.** Existe economia de recurso básica; faltam moeda dupla desenhada, moedas
especializadas, sinks endgame, instrumentação.

---

## 5.6 Monetização Ética

**Objetivo.** Sustentar o serviço vivo financeiramente respeitando o jogador — sem pay-to-win,
sem dark patterns, com odds e preços transparentes.

**Mecânica (pilares permitidos).**

- **Passe de temporada** (gratuito + premium): trilha de recompensas por jogar.
- **Ofertas de valor** (pacotes de recurso/cosmético) e **fundos de crescimento** (recompensa
  ao progredir).
- **Assinatura suave** (bônus diário/qualidade de vida — ex.: +idle, sweep extra).
- **Cosméticos** (skins de herói/cidade, molduras) — pura expressão, zero poder.
- **Gacha com garantias**: odds publicadas, **pity** garantido, caminho F2P para todo herói.
- **Ads recompensados opcionais** (mediados) — nunca forçados, sempre com troca clara de valor.
- **Regra de ouro**: hard currency compra _tempo/conveniência/cosmético_, nunca _teto de poder_
  inacessível a F2P.

**Fluxo.** Jogador F2P progride de verdade; pagante compra tempo/estilo. Ofertas aparecem em
momentos de valor real (não de desespero). Transparência gera confiança e LTV saudável.

**Interface.** Loja limpa por categorias, odds visíveis, comparativo de valor honesto, sem
timers manipulativos nem "última chance" falso.

**Integração.** Passe casa com missões/temporada; gacha com heróis/pets; cosméticos com
coleção; ads com economia.

**Retenção.** Monetização ética preserva a base F2P (que sustenta a economia social) e a
reputação — condição de um serviço de anos. Ausência total hoje.

---

## 5.7 LiveOps, Temporadas e Eventos

**Objetivo.** Manter o jogo _fresco_ indefinidamente. É o que separa um jogo que dura 2 semanas
de um que dura 5 anos.

**Mecânica.**

- **Calendário de eventos** rotativos (coleta, desafio de combate, corrida de ranking, chefe
  temático, minigame) com config remota (sem update de app).
- **Temporadas** (4–8 semanas): tema, passe, novo herói/facção, reset competitivo, capítulo,
  recompensas cosméticas exclusivas.
- **A/B testing** e ajuste de balanceamento por dados.
- **Cadência**: sempre há um evento ativo e o próximo anunciado (nunca "tela vazia").

**Fluxo.** Jogador abre → vê evento do dia/semana → participa → coleta trilha do passe → antecipa
a próxima temporada. A novidade operada renova o motivo de voltar.

**Interface.** Hub de eventos com calendário, trilhas de temporada/passe, banners do evento
ativo, e contagem regressiva.

**Integração.** Orquestra todos os sistemas (eventos usam combate/coleção/guilda/economia);
depende de servidor/config remota e telemetria.

**Retenção.** É o motor de retenção de longuíssimo prazo. Sem LiveOps, todo conteúdo finito
esgota. Ausência total hoje.

---

## 5.8 Meta social e competitiva (conquistas, ranking, social)

**Objetivo.** Dar status, comparação e conexão — motivadores que independem da própria
progressão.

**Mecânica.**

- **Conquistas**: marcos permanentes (coleção, combate, cidade, social) com recompensa e
  exibição (títulos/molduras).
- **Rankings**: por poder, arena, contribuição a chefe, evento, guilda — global/servidor/amigos,
  com recompensas por faixa e reset sazonal.
- **Social**: chat (global/guilda/privado), lista de amigos, presentes diários entre amigos,
  perfil com vitrine (heróis/títulos), empréstimo de herói para batalhas de amigo.

**Fluxo.** Compara-se no ranking → busca subir → exibe conquistas/títulos → interage no chat →
presenteia amigos. Status e conexão como motores paralelos à progressão.

**Interface.** Telas de ranking com abas, mural de conquistas, perfil de jogador, chat integrado
e não intrusivo.

**Integração.** Cobre todos os sistemas (conquistas os medem); ranking usa PvP/chefes/eventos;
social conecta guilda/amigos.

**Retenção.** Status + comparação social + conexão = motivadores duráveis independentes do teto
de poder. Ausência total hoje.
