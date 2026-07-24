# 07 — Gap Competitivo (sistema a sistema)

Comparação direta entre o **estado atual** de Age of Legends e o **padrão de mercado** do gênero
(a referência live-service global). Escala de estado:

- ⬛ **Inexistente** — nem começou.
- 🟥 **Esboço** — maquete/lógica parcial, longe do padrão.
- 🟨 **Parcial** — funciona, faltam profundidade/polimento.
- 🟩 **Padrão** — no nível de mercado.

## Matriz de gap

| Sistema                         | Age of Legends | Padrão de mercado                                        |    Gap     | Prioridade |
| ------------------------------- | :------------: | -------------------------------------------------------- | :--------: | :--------: |
| Combate (visual + tático)       |       🟥       | Cena animada, habilidades, ultimate, sinergia, game feel | **Enorme** |     M      |
| Heróis colecionáveis            |       🟥       | Habilidades, estrelas, fragmentos, facções, bio/arte     | **Enorme** |     M      |
| Formação estratégica            |       🟥       | Posições, sinergias, contadores, presets                 |   Grande   |     M      |
| Progressão (múltiplos trilhos)  |       🟥       | 6–8 trilhos entrelaçados                                 | **Enorme** |     M      |
| Cidade/base                     |       🟨       | Filas, função metagame, desbloqueios, defesas, expansão  |   Médio    |     M      |
| Campanha PvE                    |       🟥       | Capítulos, chefes, dificuldades, idle, sweep, drops      |   Grande   |     M      |
| Idle/AFK rewards                |       🟨       | Idle rico com cap, coleta, bônus offline                 |   Médio    |     M      |
| Onboarding/FTUE                 |       ⬛       | Tutorial scriptado, 1ª vitória <90s, herói grátis        | **Enorme** |     M      |
| Game feel (áudio+juice)         |       🟥       | Música adaptativa, SFX, partículas, haptics              | **Enorme** |     M      |
| Servidor autoritativo           |       ⬛       | Estado autoritativo, anti-cheat, multi-device            | **Enorme** |     M      |
| Missões (diária/semanal/growth) |       🟥       | Sistema completo + funil de crescimento                  |   Grande   |     M      |
| Economia (moeda dupla+sinks)    |       🟥       | Soft/hard, moedas especiais, sinks, instrumentação       |   Grande   |     S      |
| Equipamento                     |       ⬛       | Slots, raridade, atributos, conjuntos, aprimoramento     | **Enorme** |     S      |
| Craft/forja                     |       ⬛       | Receitas, materiais, reforja, reciclagem                 |   Grande   |     S      |
| Inventário                      |       ⬛       | Categorias, filtros, ações em massa, baús                |   Médio    |     S      |
| Gacha/invocação                 |       ⬛       | Odds transparentes, pity, banners                        |   Grande   |     S      |
| PvP (arena + mundo)             |       ⬛       | Assíncrono, ligas, ranking, temporada                    | **Enorme** |     S      |
| Guildas                         |       ⬛       | Doação, tecnologia, guerra, chefe, loja, chat            | **Enorme** |     S      |
| Chefes mundiais                 |       ⬛       | HP compartilhado, contribuição, ranking                  |   Grande   |     S      |
| Mundo vivo explorável           |       ⬛       | Mapa persistente, território, névoa, eventos             | **Enorme** |     S      |
| Exploração contínua             |       ⬛       | Expedições, masmorras, descobertas                       |   Grande   |     C      |
| Pets/criaturas                  |       ⬛       | Coleção paralela, vínculo, bônus                         |   Grande   |     C      |
| Pesquisa/academia               |       🟥       | Árvore de bônus globais idle                             |   Médio    |     C      |
| Monetização ética               |       ⬛       | Passe, ofertas, cosméticos, gacha justo, ads opc.        |   Grande   |     S      |
| LiveOps/config remota           |       ⬛       | Calendário, eventos remotos, A/B                         | **Enorme** |     S      |
| Temporadas/passe                |       ⬛       | Tema, reset, novo herói, trilha de recompensa            |   Grande   |     S      |
| Eventos temporários             |       ⬛       | Rotação semanal de modos                                 |   Grande   |     S      |
| Conquistas                      |       ⬛       | Marcos permanentes + títulos                             |   Médio    |     C      |
| Ranking                         |       ⬛       | Múltiplas ladders, reset sazonal                         |   Médio    |     S      |
| Social/chat/amigos              |       ⬛       | Chat, amigos, presentes, perfil                          |   Grande   |     S      |
| UI moderna + badges             |       🟥       | Hub, next-best-action, motion, acessibilidade            |   Médio    |     M      |
| Localização                     |     🟥 (1)     | 24 idiomas (referência)                                  |   Grande   |     C      |
| Telemetria/analytics            |       ⬛       | Funil, coortes, economia instrumentada                   |   Grande   |     S      |

## Leitura do gap

- **Contagem**: dos ~33 sistemas mapeados, **~20 são ⬛ inexistentes**, ~8 são 🟥 esboço, ~4 são
  🟨 parciais, **0 são 🟩 padrão**. Nenhum sistema está hoje no nível de mercado.
- **Concentração de risco**: os "Enorme + M" (combate, heróis, progressão, FTUE, game feel,
  servidor) são a Fase 1–2. Sem eles não há jogo; com eles há um núcleo defensável.
- **Dependência mestra**: **servidor autoritativo** destrava PvP, guildas, chefes, mundo,
  ranking, LiveOps e monetização social. É o maior multiplicador de escopo — priorizá-lo cedo
  encurta o caminho de tudo que vem depois.
- **Maior ROI imediato**: **combate + FTUE + game feel**. Baixo custo relativo, impacto máximo
  na percepção de "isto é um jogo" e na retenção D1.

## Diferenças de qualidade (não só de presença)

Mesmo onde algo "existe" (🟥/🟨), a distância de _qualidade_ é grande:

- **Arte**: procedural/programmer-art vs. arte esquelética animada e coesa por facção.
- **Combate**: comparação de números vs. espetáculo tático legível.
- **Cidade**: cenário estático vs. mundo com vida ambiental (NPCs, clima, dia/noite).
- **Feedback**: silêncio vs. sinfonia audiovisual de recompensa.
- **Onboarding**: tela vazia vs. jornada scriptada de conversão.

O gap, portanto, é duplo: **de escopo** (o que não existe) e **de acabamento** (o que existe não
está no nível). O roadmap ataca os dois, priorizando escopo-núcleo antes de acabamento-amplo.
