# 08 — Roadmap em 6 Fases

Plano de execução do estado atual (fundação técnica + protótipo idle) até um serviço vivo
competitivo. Cada fase encerra em um **marco jogável testável**, não em documentação.

**Legenda de esforço** (equipe pequena: 1–2 devs, 1 designer, 1 artista part-time), em
_pessoa-semanas_ (P-sem), faixa otimista–provável. São ordens de grandeza para planejamento,
não compromissos.

**Princípio-mestre**: _nada de uma fase seguinte começa antes do marco da fase atual estar
divertido._ A disciplina de priorização é o que impede a morte por ambição.

---

## FASE 1 — MVP Jogável ("isto é um jogo")

**Meta.** Provar o game feel do combate e o loop de sessão em uma fatia vertical polida. É a
fase que responde "onde está o jogo?".

**Funcionalidades.**

- **Decisão de cliente único** e migração do protótipo para a stack de produção (PixiJS + ECS
  compartilhado). Fim do cisma.
- **Combate renderizado v1**: unidades animadas (idle/atacar/ultimate/morte), habilidades +
  ultimate por energia, HP/energia bars, dano com hierarquia, velocidade 2x/auto, tela de
  resultado com "chuva" de recompensa.
- **Heróis v1 como sistema**: 8–12 heróis com 1 básica + 1 passiva + 1 ultimate, raridade,
  facção com sinergia simples, detalhe de herói.
- **Formação v1**: 2 linhas, sinergia de facção, poder total.
- **Cidade v1 refinada**: 6–8 prédios com função clara + filas de construção.
- **Campanha v1**: 1 capítulo (10–15 estágios) + idle rewards + sweep.
- **FTUE v1**: abertura scriptada, 1ª vitória <90s, 1 herói raro grátis, primeiras missões.
- **Game feel v1**: SFX essenciais, música de cidade/batalha/vitória, partículas e juice no
  combate, login diário.
- **Missões diárias v1**.

**Dependências.** Decisão de cliente único (bloqueia tudo); pipeline de arte/animação mínimo;
biblioteca de áudio.

**Esforço.** 10–16 P-sem. (Combate 4–6 · Heróis/formação 2–3 · Cidade 1–2 · Campanha/FTUE 2–3 ·
Game feel/áudio 1–2.)

**Riscos.** (a) Subestimar o custo de arte/animação — mitigar com estilo art-direcionado
viável para a equipe; (b) escopo do combate inflar — travar o vocabulário de habilidades v1;
(c) migração de cliente atrasar — fazer spike técnico antes de comprometer.

**Impacto no jogador.** Transformação de percepção: de "maquete" para "jogo com personagens e
combate que dá gosto". É o marco que valida (ou reorienta) toda a visão.

---

## FASE 2 — Alpha ("há profundidade e uma conta")

**Meta.** Adicionar profundidade de progressão e o backbone online. O jogo passa a ter horizonte
de médio prazo e estado seguro.

**Funcionalidades.**

- **Servidor autoritativo v1**: contas, estado no servidor, combate determinístico validado no
  servidor, multi-device. (Dependência mestra de toda a Fase 3+.)
- **Progressão multi-trilho**: ascensão por estrelas + fragmentos, habilidades (livros),
  pesquisa/academia (idle).
- **Equipamento v1 + inventário v1 + craft v1**.
- **Gacha/invocação v1** com odds transparentes e pity.
- **Campanha 3–5 capítulos + dificuldade Elite**.
- **Missões semanais + funil de crescimento + conquistas v1**.
- **Economia**: moeda dupla desenhada + primeiros sinks endgame + instrumentação (analytics).

**Dependências.** Fase 1 completa; servidor autoritativo antes de gacha/economia (integridade).

**Esforço.** 14–22 P-sem. (Servidor 5–8 · Progressão/equip/craft/inventário 5–7 · Gacha 2–3 ·
Conteúdo campanha 2–3 · Economia/analytics 2–3.)

**Riscos.** (a) Complexidade de netcode/anti-cheat — começar com autoridade simples e endurecer;
(b) inflação econômica por falta de sinks — instrumentar desde o dia 1; (c) balanceamento de
gacha/economia — tunar com dados reais de alpha fechado.

**Impacto no jogador.** "Tenho o que fazer por semanas": coleção evolui, builds importam, conta
segura em qualquer device. Retenção de médio prazo aparece.

---

## FASE 3 — Beta ("há outras pessoas")

**Meta.** Ligar a camada social e competitiva — o que dá retenção de longo prazo e conteúdo
gerado por jogadores.

**Funcionalidades.**

- **Guildas**: doação, tecnologia, chat, loja de guilda, objetivos semanais.
- **PvP assíncrono**: arena, ligas, ranking com reset sazonal.
- **Chefes mundiais** (contribuição + ranking).
- **Social**: amigos, presentes, perfil, chat global/guilda.
- **Ranking** multi-ladder.
- **Pets/criaturas v1** (segundo eixo de coleção).
- **Localização** (estrutura i18n + primeiros idiomas).

**Dependências.** Servidor autoritativo (Fase 2) — pré-requisito absoluto de tudo aqui.

**Esforço.** 16–24 P-sem. (Guildas 5–7 · PvP/ranking 4–6 · Chefes mundiais 2–3 · Social 3–4 ·
Pets 2–3 · i18n 2–3.)

**Riscos.** (a) Matchmaking/balanceamento de PvP injusto — proteções de novato + faixas por
poder; (b) toxicidade em chat — moderação/filtragem desde o início; (c) carga de servidor em
eventos coletivos — testes de carga antes do beta aberto.

**Impacto no jogador.** Pertencimento e competição: guilda que depende dele, rivais no ranking,
abates coletivos. É o salto para "retenção de meses".

---

## FASE 4 — Soft Launch ("prova de retenção e economia")

**Meta.** Lançar em mercados-teste para validar retenção (D1/D7/D30), monetização e economia com
dados reais, antes de escalar. Fase de _dados_, não de novas features grandes.

**Funcionalidades.**

- **Monetização ética completa**: loja, passe de temporada, ofertas de valor, cosméticos,
  (opcional) ads recompensados mediados.
- **LiveOps v1**: config remota, calendário de eventos, 3–4 tipos de evento rotativos.
- **Temporadas v1**: tema, passe, reset competitivo.
- **Telemetria de produto**: funil de onboarding, coortes de retenção, economia por moeda,
  A/B testing.
- **Polimento de FTUE e economia** guiado por dados de soft launch.

**Dependências.** Fases 1–3; telemetria e LiveOps operacionais antes de abrir torneira de
aquisição.

**Esforço.** 12–18 P-sem. (Monetização 4–6 · LiveOps/config remota 4–6 · Temporada 2–3 ·
Telemetria/experimentação 2–3.)

**Riscos.** (a) Métricas de retenção abaixo do alvo — o soft launch existe para descobrir isso
cedo e corrigir; (b) economia desbalanceada sob dinheiro real — ajuste iterativo por dados;
(c) tentação de escalar antes da hora — só ir a global com D1/D7/D30 saudáveis.

**Impacto no jogador.** Experiência mais justa e polida; jogadores de soft launch moldam o jogo.
Do lado do produto, valida a viabilidade como serviço.

---

## FASE 5 — Global Launch ("escala")

**Meta.** Lançamento global com robustez de escala, localização ampla e conteúdo suficiente para
sustentar aquisição em massa.

**Funcionalidades.**

- **Localização ampla** (dezenas de idiomas — a referência empacota 24).
- **Robustez de escala**: sharding de servidores/mundos, filas, observabilidade, mitigação de
  cheat/fraude, suporte ao jogador.
- **Guerra de guilda / mundo vivo completo** (se ainda não pleno).
- **Conteúdo de lançamento**: campanha estendida, roster maior, primeira grande temporada.
- **Compliance**: privacidade por região, classificação etária, lojas.

**Dependências.** Soft launch com métricas aprovadas; infra de escala testada sob carga.

**Esforço.** 14–22 P-sem. (Infra/escala/observabilidade 5–8 · Localização ampla 3–4 · Mundo/
guerra 3–5 · Conteúdo de lançamento 3–5.)

**Riscos.** (a) Picos de carga no lançamento — testes de carga + capacidade elástica; (b) custo
de aquisição vs LTV — só escalar marketing com unit economics provada; (c) atrito de compliance
por região — preparar cedo.

**Impacto no jogador.** Experiência global estável, no idioma do jogador, com mundo social pleno.
O jogo passa a existir "para valer" em escala.

---

## FASE 6 — LiveOps e Expansão Contínua ("serviço de anos")

**Meta.** Operar o jogo como serviço vivo indefinidamente: novidade constante, saúde econômica e
crescimento sustentado.

**Funcionalidades.**

- **Cadência de temporadas** (novo herói/facção, capítulo, tema, cosméticos por temporada).
- **Rotação de eventos** madura (novos modos, colaborações originais, eventos comunitários).
- **Novos sistemas endgame** conforme dados (prestígio, ligas superiores, novos eixos de
  progressão).
- **Otimização data-driven** contínua (economia, balanceamento, funil, ofertas).
- **Expansão de conteúdo** (mundo, exploração, chefes, PvP modes).

**Dependências.** Global launch estável; time de LiveOps e pipeline de conteúdo contínuo.

**Esforço.** Contínuo (ex.: ciclo de temporada de 4–8 semanas com ~6–10 P-sem por ciclo,
recorrente).

**Riscos.** (a) Fadiga de conteúdo/burnout do time — pipeline sustentável e reuso inteligente;
(b) power creep — governança de balanceamento; (c) erosão de confiança por monetização agressiva
— manter a disciplina ética que preserva LTV de longo prazo.

**Impacto no jogador.** Sempre há algo novo e uma razão para voltar mês após mês. É a fase que
realiza a promessa de "centenas de horas" e a longevidade de anos.

---

## Visão consolidada

| Fase            | Marco jogável                  | Esforço (P-sem) | Desbloqueia               |
| --------------- | ------------------------------ | :-------------: | ------------------------- |
| 1 · MVP         | Combate + loop que "dá gosto"  |      10–16      | Prova de conceito jogável |
| 2 · Alpha       | Profundidade + conta online    |      14–22      | Retenção de médio prazo   |
| 3 · Beta        | Guildas + PvP + social         |      16–24      | Retenção de longo prazo   |
| 4 · Soft Launch | Monetização + LiveOps + dados  |      12–18      | Viabilidade de serviço    |
| 5 · Global      | Escala + localização + mundo   |      14–22      | Alcance global            |
| 6 · LiveOps     | Temporadas + expansão contínua |   Recorrente    | Longevidade de anos       |

**Caminho crítico**: _cliente único (F1) → combate/game feel (F1) → servidor autoritativo (F2)
→ social/PvP (F3) → LiveOps/monetização (F4)._ Tudo o mais pendura nesses cinco pregos.

**Recomendação final de sequência imediata**: comece pela **fatia vertical de combate** dentro
da Fase 1. É o maior ROI de percepção e retenção, valida a stack de produção, e dá ao projeto —
pela primeira vez — algo que se _joga_ e se _sente_ como um jogo.
