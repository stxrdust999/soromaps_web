# Alinhamento full-stack: hidratação de métricas, pautas editoriais livres, geolocalização real e microinterações de UI

> Módulo: user/explorer & admin/moderation · Rotas: `/admin/dashboard`, `/admin/reports`, `/profile/*`, `/places/new`, `/discover`, `/community/new-story`, `/pautas/[slug]` · Data: 2026-10-26

## O que foi implementado

Consolidação full-stack (`soromaps_web` + `soromaps_api`) eliminando falhas de tradução LINQ no PostgreSQL, dados mockados residuais no painel de denúncias, restrições rígidas na autoria de pautas e inconsistências visuais no tema escuro e nos fluxos de mapa.

| Peça | Arquivo |
|---|---|
| Métricas do dashboard admin sem funções não traduzíveis no EF Core | `soromaps_api/Services/AdminDashboardService.cs` |
| Estatísticas de visitas por categoria ordenadas antes da projeção em record | `soromaps_api/Services/ActivityService.cs`, `src/app/(app)/(explorer)/profile/stats/_components/stats-content.tsx` |
| Snapshot enriquecido de denúncias e lista real de denunciantes em lote | `soromaps_api/DTOs/Reports/ReportDtos.cs`, `soromaps_api/Services/ReportService.cs`, `src/app/(app)/admin/reports/_components/use-reports.ts` |
| Critérios descritivos de conquistas e modal de progresso detalhado | `soromaps_api/Services/AchievementService.cs`, `src/app/(app)/(explorer)/profile/achievements/_components/achievements-content.tsx` |
| Hidratação da foto e role do usuário na Sidebar via `getCurrentUser` | `src/components/blocks/app-sidebar.tsx`, `src/components/blocks/sidebar-user-section.tsx` |
| Transição circular de tema via View Transitions API (Magic UI) | `src/components/ui/animated-theme-toggler.tsx`, `src/styles/globals.css` |
| Busca de endereço no mapa com `GooeyInput` (Aceternity UI) | `src/components/ui/gooey-input.tsx`, `src/components/blocks/map-address-search.tsx` |
| Persistência de formulário ao reposicionar pino e feedback de GPS inicial | `src/app/(app)/(explorer)/places/new/_components/new-place-workspace.tsx`, `create-marker-form.tsx` |
| Cálculo de distância real via `navigator.geolocation` em "Perto de você" | `src/app/(app)/(explorer)/discover/_components/use-discover.ts`, `nearby-list.tsx` |
| Rota `/community/new-story`, locais opcionais e controle de visibilidade de rascunhos | `src/app/(app)/(explorer)/community/new-story/`, `src/app/(app)/(explorer)/pautas/[slug]/`, `soromaps_api/Services/StoryService.cs` |
| Superfície de `FilterChip` alinhada ao `Button variant="outline"` no dark mode | `src/components/table/filter-chip.tsx` |

## Decisões

### 1. Tradução LINQ no EF Core + Npgsql: projetar tipos primitivos antes de instanciar `record` posicional
O EF Core falha com HTTP 500 ao aplicar `.OrderByDescending(...)` sobre propriedades de um `record` com construtor posicional recém-projetado no `IQueryable`, bem como ao traduzir `(now - p.CreatedAt).TotalHours` ou subcoleções `.Distinct().ToList()` dentro de `GroupBy`. A regra adotada nos serviços (`AdminDashboardService` e `ActivityService`) é ordenar sobre projeções anônimas no SQL, materializar com `ToListAsync()` e só então instanciar os records de DTO e calcular intervalos de tempo em memória, sempre com datas normalizadas em `DateTimeKind.Utc`.

### 2. Pautas editoriais sem obrigatoriedade de locais (`MIN_PLACES = 0`)
A exigência anterior de vincular no mínimo 2 locais obrigava toda pauta da cidade a funcionar como comparativo de estabelecimentos. Tanto os schemas Zod (`generateStorySchema` e `publishStorySchema`) quanto `StoryService.PublishAsync` e o prompt do Gemini (`src/lib/gemini.ts`) passaram a aceitar `0` ou mais locais: quando há locais vinculados, o modelo continua ancorado nos fatos e tokens `{{place:ID|Nome}}`; quando não há, redige leitura editorial sobre Sorocaba sem inventar estabelecimentos.

### 3. Padronização da rota `/community/new-story` com redirect legado
Para alinhar a nomenclatura de rotas em inglês (`/places/new`, `/discover`, `/community`, `/profile/settings`), o editor de pautas foi movido para `/community/new-story`, mantendo `/community/nova-pauta/page.tsx` apenas como `redirect()` que preserva o parâmetro `?draft=`.

### 4. Compatibilidade de enums serializados em camelCase (`JsonStringEnumConverter`)
Como a API serializa enums como strings em camelCase (`"published"`, `"draft"`, `"aiGenerated"`, `"place"`, `"review"`, `"comment"`), comparações estritas com números (`data.status === 1` ou `Number(item.targetType)`) faziam toda pauta publicada ser lida como rascunho e toda denúncia cair como `"ponto"`. Os mapeadores de front-end passaram a resolver tanto a representação textual quanto a numérica, além de bloquear rascunhos no servidor (`notFound()`) para usuários não-administradores.

### 5. Persistência de formulário por ocultação de árvore (`hidden`) em `/places/new`
Em vez de desmontar `CreateMarkerForm` quando o usuário volta ao estágio `"picking"` para ajustar o pino no mapa (o que destruía o estado do `useForm` e o arquivo de foto recortado em memória), o formulário permanece montado com classe `hidden` após a primeira abertura e sincroniza apenas coordenadas e bairro via `useEffect`.

### 6. View Transitions API com `clip-path` inicial travado em CSS (`--magicui-theme-vt-clip-from`)
Na troca de tema com `AnimatedThemeToggler`, `transition.ready` resolve em uma microtask assíncrona após a criação de `::view-transition-new(root)`. Para impedir 1 frame de flicker com o tema novo em tela cheia antes do `.animate()` iniciar, a variável CSS `--magicui-theme-vt-clip-from` já fixa `::view-transition-new(root)` em `circle(0px at X Y)` antes da chamada a `document.startViewTransition` e congela transições CSS paralelas (`transition: none !important`) durante o snapshot.

## Pendências conhecidas

- Os componentes legados `src/app/(app)/(explorer)/profile/_components/profile-account-sheet.tsx` e `src/app/(app)/(explorer)/community/nova-pauta/_components/story-editor-workspace.tsx` permanecem no repositório sem importações ativas até limpeza autorizada.
- Em `/home`, a seção `FeedNearbySection` ainda consome a distância calculada no servidor a partir do centro de Sorocaba (a geolocalização ativa do navegador foi aplicada especificamente a `/discover` e `/places/new`).
