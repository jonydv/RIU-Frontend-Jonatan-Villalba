# Superhéroes — SPA Angular 22 con SSR

Aplicación de gestión de superhéroes: listado paginado con búsqueda, alta y edición en modal,
borrado con confirmación y vista de detalle, sobre un backend simulado en memoria.

## Stack

| Pieza            | Versión                          |
| ---------------- | -------------------------------- |
| Angular          | 22.1                             |
| Angular Material | 22.1 (Material 3, `mat.theme()`) |
| Angular SSR      | 22.1 (`outputMode: server`)      |
| TypeScript       | 6.0                              |
| RxJS             | 7.8                              |
| Express          | 5.1                              |
| Vitest           | 4.0                              |
| Node             | 24 (imagen Docker)               |

## Puesta en marcha

```bash
npm install
npm start                 # http://localhost:4200
```

### Otros comandos

```bash
npm run build             # build de producción (browser + server)
npm run serve:ssr         # sirve el build SSR en http://localhost:4000
npm test                  # tests en modo watch
npm run test:ci           # tests + coverage, falla si baja del 80%
npm run lint              # ESLint sobre .ts y .html
npm run format            # Prettier
npm run i18n:extract      # genera src/locale/messages.xlf
```

### Docker

```bash
docker compose up --build   # http://localhost:4000
```

## Arquitectura

```
src/app/
├── core/           infraestructura transversal
│   ├── constants/  API, rutas, storage, breakpoints, tamaños de diálogo
│   ├── interceptors/  fake backend + loading
│   ├── services/   hero store (persistencia), loading, layout
│   └── tokens/     API_CONFIG
├── shared/         reutilizable entre features
│   ├── components/ confirm dialog, loading overlay
│   ├── directives/ appUppercase
│   ├── services/   bus de eventos de héroes
│   └── validators/ fecha no futura
└── features/heroes/
    ├── components/ card list, tabla, buscador, toggle de vista, form dialog
    ├── constants/  entidad, formulario, listado, eventos
    ├── data/       HeroService (HTTP) + seed de 25 héroes
    ├── models/     Hero, HeroPage, HeroDialogData, HeroEvent
    ├── pages/      listado, detalle, not found
    ├── services/   flujos de alta/edición y borrado
    ├── stores/     estado del listado (búsqueda, paginación, modo de vista)
    └── validators/ nombre único (async)
```

46 archivos de código y 21 de tests.

## Decisiones de diseño

### Backend simulado por interceptor HTTP

El fake backend es un `HttpInterceptorFn` que intercepta las URLs de `/api/heroes` y responde
desde un store en memoria. La alternativa —un servicio que devuelva datos directamente— habría
evitado la capa HTTP por completo.

Se eligió el interceptor porque deja el código de la aplicación **idéntico al que usaría contra un
backend real**: `HeroService` hace `http.get`/`post`/`put`/`delete`, los errores llegan como
`HttpErrorResponse` con status 404 real, y el interceptor de loading se dispara solo. Migrar a una
API real es borrar un archivo y cambiar `apiBaseUrl`. Además hace testeable el camino completo,
incluidos paginación, filtrado y códigos de error.

### Angular 22 en lugar de la 21 LTS

La 22 trae hydration incremental y el builder `unit-test` estabilizado sobre Vitest. Al ser un
proyecto nuevo sin restricciones de compatibilidad, el costo de adoptar la última es bajo y evita
nacer desactualizado.

### El store persiste solo en el navegador

`HeroStoreService` arranca desde el seed y, en el navegador, hidrata desde `localStorage`. En el
servidor **siempre** usa el seed, detrás de `isPlatformBrowser`: en SSR no existe `localStorage` y
tampoco tendría sentido compartir el estado de un usuario entre todos.

Esto crea una divergencia deliberada: el HTML del servidor puede no coincidir con los datos del
cliente. Por eso se **desactiva el transfer cache** para `/api/heroes`:

```ts
provideClientHydration(
  withEventReplay(),
  withHttpTransferCacheOptions({ filter: (req) => !req.url.startsWith(heroesUrl) }),
);
```

Sin ese filtro el cliente reusaría la respuesta serializada por el servidor en lugar de consultar su
propio `localStorage`, y el listado mostraría datos que no son los del usuario.

### `as const` en lugar de `enum`

Todas las constantes son objetos `as const` con su tipo derivado:

```ts
export const HERO_VIEW_MODE = { card: 'card', table: 'table' } as const;
export type HeroViewMode = (typeof HERO_VIEW_MODE)[keyof typeof HERO_VIEW_MODE];
```

Los `enum` de TypeScript generan código en runtime, no son _tree-shakeable_ y su variante numérica
acepta cualquier número. El patrón `as const` es tipado estructural puro: desaparece al compilar y
el tipo resultante es la unión exacta de valores literales.

### Modo de vista del listado y las dos trampas de SSR

La lista arranca en **tarjetas** en toda resolución; la tabla es una alternativa opcional en desktop.
El breakpoint no elige el modo, solo lo pisa:

```ts
effectiveViewMode = isHandset() ? card : viewMode();
```

Dos detalles que romperían la hidratación si se resolvieran de forma ingenua:

1. **La preferencia guardada no se lee en el render inicial.** El servidor no tiene `localStorage`,
   así que siempre emite tarjetas. Leerla en el constructor haría que el primer render del cliente
   difiera del HTML del servidor. Se lee en `afterNextRender()`: la hidratación termina contra
   tarjetas y recién después el signal cambia a tabla si corresponde.
2. **El toggle se oculta con CSS, no con `@if (!isHandset())`.** `BreakpointObserver` no matchea nada
   en el servidor, así que el `@if` renderizaría el toggle en el HTML del servidor y lo quitaría al
   hidratar en un móvil real. Se oculta con `@media`, que no participa de la hidratación.

### Estado del listado con signals

`HeroListStoreService` combina `searchTerm`, `pageIndex` y `pageSize` en un `computed`, lo convierte
a observable y aplica `debounceTime` + `distinctUntilChanged` + `switchMap` antes de volver a signal.
Un `refreshTrigger` interno permite forzar un refetch tras alta, edición o borrado sin alterar la
búsqueda ni la página actual.

Se provee **a nivel de componente**, no en `root`: es estado de una pantalla, y así cada visita al
listado arranca limpio.

### Diseño

Tema Material 3 con paleta violeta. Las tarjetas son de tipo póster: imagen a sangre completa con
degradado y el nombre encima. La vista de detalle usa la imagen completa (`object-fit: contain`)
sobre una copia desenfocada de sí misma, para que no queden franjas vacías con imágenes de cualquier
proporción.

Accesibilidad: acciones visibles en `:hover` **y** `:focus-within` (si solo fuera hover serían
inalcanzables por teclado), listas semánticas, _stretched link_ para que toda la tarjeta sea
clickeable sin perder el nombre accesible, `aria-label` específicos por héroe, `:focus-visible`
global y respeto por `prefers-reduced-motion`.

## Tests

```bash
npm run test:ci
```

136 tests en 21 archivos. Los umbrales de coverage están fijados al 80% en `angular.json` y el
comando **falla** si alguna métrica baja de ahí.

| Métrica    | Cobertura |
| ---------- | --------- |
| Statements | 92.04%    |
| Branches   | 87.70%    |
| Functions  | 84.84%    |
| Lines      | 91.80%    |

## i18n

Los textos se marcaron con `i18n` en plantillas y `$localize` en TypeScript a medida que se escribió
cada componente, no en una pasada posterior. `sourceLocale` es `es`.

```bash
npm run i18n:extract     # → src/locale/messages.xlf (68 mensajes)
```

## Mapeo de requisitos

| Requisito                              | Dónde                                                               |
| -------------------------------------- | ------------------------------------------------------------------- |
| Listado de héroes                      | `pages/hero-list-page` + `components/hero-card-list` y `hero-table` |
| Obtener todos los héroes               | `HeroService.getHeroes()`                                           |
| Obtener un héroe por id                | `HeroService.getHeroById()`                                         |
| Buscar héroes que contengan un texto   | `HeroService.searchByName()` y parámetro `search` del listado       |
| Crear héroe                            | `HeroService.createHero()` + `hero-form-dialog` en modo `create`    |
| Actualizar héroe                       | `HeroService.updateHero()` + `hero-form-dialog` en modo `edit`      |
| Eliminar héroe                         | `HeroService.deleteHero()` + `confirm-dialog`                       |
| Paginación del listado                 | `mat-paginator` + `HeroListStoreService`                            |
| Directiva de mayúsculas                | `shared/directives/uppercase.directive.ts`                          |
| Interceptor de carga                   | `core/interceptors/loading.interceptor.ts` + `loading-overlay`      |
| Formularios reactivos con validaciones | `hero-form-dialog` (incluye validación async de nombre único)       |
| Tests unitarios                        | 21 archivos `.spec.ts`, coverage ≥ 80%                              |
| Angular Material                       | listado, formularios, diálogos, paginador, chips, slider            |
| Docker                                 | `Dockerfile` multi-stage + `docker-compose.yml`                     |

## Verificación manual

Con la aplicación corriendo:

1. El listado pagina 25 héroes de a 10 y el filtro muestra el overlay de carga.
2. El alta abre un modal y el nombre se transforma a mayúsculas mientras se escribe.
3. Un nombre ya existente marca error de duplicado.
4. La edición precarga todos los campos.
5. El borrado pide confirmación y muestra un aviso al completarse.
6. `/heroes/:id` sobrevive a F5 y llega renderizado desde el servidor.
7. Un id inexistente y una ruta desconocida caen en la pantalla de no encontrado.
8. Un héroe dado de alta sigue estando tras recargar.
9. A 1280px la lista arranca en tarjetas con el toggle visible; al pasar a tabla y recargar, vuelve
   en tabla. A 375px fuerza tarjetas y el toggle desaparece.
