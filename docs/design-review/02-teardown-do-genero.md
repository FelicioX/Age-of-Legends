# 02 — Teardown do Gênero (referência de design)

Este capítulo destila **por que** os RPG/4X mobile live-service de topo retêm jogadores por
anos, para que Age of Legends reproduza o _valor_ com sistemas originais. A referência de
mercado é usada apenas como parâmetro de padrões — nada é copiado.

## 1. A arquitetura de loops (o coração da retenção)

O gênero opera **loops aninhados** em escalas de tempo diferentes. A genialidade é que cada
loop alimenta o próximo, e sempre há um "próximo passo visível" e uma "vitória recente".

```
LOOP DE SEGUNDOS  → Combate: atacar, ver dano, soltar ultimate, vencer.
LOOP DE MINUTOS   → Sessão: coletar idle, subir 1 herói, gastar energia, evoluir 1 prédio.
LOOP DE HORAS     → Dia: dailies, doar na guilda, tentar o chefe, abrir a oferta do dia.
LOOP DE DIAS      → Semana: guerra de guilda, ranking, evento temático, marco de progressão.
LOOP DE SEMANAS   → Temporada: passe, reset competitivo, novo herói/facção, novo capítulo.
LOOP DE MESES     → Coleção/meta: completar roster, maximizar builds, subir de servidor/liga.
```

**Princípio de design**: nenhum loop pode ter "fim de conteúdo" antes do loop maior te dar um
novo alvo. Age of Legends hoje só tem o loop de minutos, e ele esvazia rápido. O trabalho é
construir os loops de horas, dias, semanas e meses.

## 2. As camadas de sistema que sustentam cada loop

| Loop     | Sistemas que o alimentam                                               |
| -------- | ---------------------------------------------------------------------- |
| Segundos | Combate com habilidades, ultimate, formação, sinergia, "game feel"     |
| Minutos  | Idle/AFK rewards, energia, upgrade de herói/cidade, missões diárias    |
| Horas    | Dailies, guilda (doação/ajuda), chefes, loja diária, ofertas           |
| Dias     | Guerra de guilda, PvP ranqueado, eventos, marcos, chefe mundial        |
| Semanas  | Temporada/passe, reset de liga, novo herói, novo capítulo de campanha  |
| Meses    | Coleção/ascensão, equipamento endgame, pesquisa, prestígio de servidor |

## 3. Os quatro motores psicológicos (e como usá-los com ética)

1. **Progressão composta** — múltiplos trilhos (nível, estrelas, equipamento, pesquisa, pets,
   talentos) que somam poder. Sempre há _algo_ para melhorar. Ética: sem paywall de poder;
   dinheiro compra _tempo/conveniência_, não _teto_.
2. **Colecionismo** — completar o roster, subir raridade, "aquele lendário que falta". Ética:
   odds transparentes, pity garantido, caminhos F2P para todo herói.
3. **Pertencimento social** — guilda que depende de você, ranking entre conhecidos,
   cooperação. Ética: interdependência positiva, sem shaming, sem coerção de horário abusiva.
4. **Novidade operada (LiveOps)** — o jogo _muda_ toda semana: eventos, temas, desafios.
   Ética: respeitar o tempo do jogador, sessões significativas em qualquer duração.

## 4. Anatomia técnica de referência (o que a engenharia AAA implica)

Do reconhecimento do pacote de referência, os padrões de engenharia observados:

- **Engine Unity (IL2CPP AOT)** com fallback Mono — renderização rica, animação esquelética,
  partículas, pipeline de assets industrial.
- **Servidor autoritativo** para estado de mundo, PvP e economia (pré-requisito de qualquer
  sistema competitivo/social).
- **Mediação de anúncios (AppLovin MAX)** — monetização híbrida IAP + ads recompensados.
- **Telemetria de estabilidade (Firebase Crashlytics)** + presumível analytics de produto —
  economia e funil instrumentados para tuning contínuo.
- **24 idiomas empacotados** — localização como cidadã de primeira classe desde o build.
- **App Bundle com splits por ABI/densidade/idioma** — footprint otimizado por device.

**Implicação para Age of Legends**: a stack web/TS escolhida (PixiJS + Node + ECS
compartilhado) é uma alternativa válida e mais barata que Unity para 2D, _desde que_ entregue
os mesmos pilares: render rico, servidor autoritativo, telemetria, localização e LiveOps. A
tecnologia difere; os _requisitos de produto_ não.

## 5. O "primeiro minuto" (onde a maioria dos jogadores é ganha ou perdida)

O padrão de mercado para o FTUE (first-time user experience):

1. Abertura cinematográfica curta (contexto emocional).
2. Combate scriptado que o jogador _não pode perder_ — primeira dose de dopamina em <30s.
3. Primeiro herói raro/lendário **de graça** nos primeiros minutos (âncora de investimento).
4. Uma construção, uma evolução, uma vitória — provando cada pilar do loop rapidamente.
5. Gancho para o dia seguinte (missão diária, produção idle, oferta de boas-vindas).

Age of Legends hoje começa em uma tela estática sem direção. Este é um dos consertos de maior
ROI e menor custo — ver [06](06-ux-onboarding-feedback.md).

## 6. Tese de diferenciação (não basta clonar)

Competir não é copiar — é **entregar o mesmo valor com uma identidade e um gancho próprios**.
Recomendações de diferenciação para Age of Legends, a validar:

- **Combate com uma decisão a mais que o autobattler puro** — ex.: timing manual de ultimates
  com janela de sinergia (o jogador "rege" o time), preservando o conforto AFK mas premiando
  maestria.
- **Cidade que é campo de batalha** — a base importa no PvP (defesas posicionáveis), fundindo
  os pilares 4X e RPG num só espaço, em vez de telas separadas.
- **Facções com identidade cultural forte e original** — arte, música e narrativa coesas que
  criem apego (o motor de colecionismo depende de heróis _memoráveis_, não genéricos).

Essas teses são hipóteses de design a testar no vertical slice, não dogmas.
