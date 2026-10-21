# 🏆 04. Gamificação e Reputação

> [← Voltar ao Índice da Wiki](./00-home.md)

O sistema de incentivo do Soromaps foi desenhado para recompensar a **exploração real de Sorocaba** e a **qualidade da contribuição**, evitando mecânicas artificiais de acúmulo de pontos (XP).

---

## 1. Conquistas Baseadas em Eventos Reais

Cada conquista do catálogo possui um critério objetivo estruturado em três partes:
- **Ação (`event`):** Visitar um local (`visit`), publicar uma avaliação (`review`), salvar favorito (`favorite`), ter um local sugerido aprovado (`create_place`) ou comentar (`comment`);
- **Quantidade (`quantity`):** A meta numérica para desbloqueio (ex.: `1`, `5`, `10`);
- **Recorte (`target`):** Geral (`any`), de uma categoria específica (ex.: *Cafeterias*), de um bairro específico (ex.: *Campolim*) ou diversidade (*N categorias ou bairros distintos*).

Por ser baseado em contagens reais sobre o histórico do explorador, o cálculo de conquistas é **idempotente**: o usuário sempre vê em `/profile/achievements` exatamente quanto falta para alcançar a próxima medalha (ex.: *"3 de 5 parques visitados"*).

---

## 2. Títulos de Explorador

Em vez de um "Nível 1..99" arbitrário, todo explorador recebe uma credencial pública derivada diretamente do total de conquistas que já desbloqueou:

| Conquistas Desbloqueadas | Título Exibido |
|---|---|
| **0 a 2** | 🌱 **Novato** |
| **3 a 6** | 🧭 **Explorador** |
| **7 a 12** | 🗺️ **Guia Local** |
| **13 ou mais** | 🏅 **Veterano** |

Esse título acompanha o nome do usuário em suas avaliações, nos comentários e no ranking da comunidade.

---

## 3. Selo de Explorador Verificado

O selo de **Explorador Verificado** destaca moradores cuja opinião tem histórico consistente e confiável na cidade. Ele não depende de aprovação subjetiva: qualquer conta que cumpra simultaneamente os **4 critérios públicos** abaixo recebe o selo automaticamente:

1. **Presença na cidade:** Pelo menos **5 visitas** (check-ins) registradas;
2. **Contribuição ativa:** Pelo menos **3 avaliações** publicadas;
3. **Boa conduta:** **Zero avaliações removidas** pela moderação;
4. **Maturidade da conta:** Pelo menos **30 dias** desde o cadastro.

No perfil pessoal (`/profile`), o usuário visualiza esses quatro indicadores em formato de checklist para saber exatamente o que falta para conquistar o selo.
