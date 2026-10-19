# SauceDemo · Playwright + TypeScript

[![Playwright Tests](https://github.com/LuisContrerasGlz/Automation_Playwright_AI/actions/workflows/playwright.yml/badge.svg)](https://github.com/LuisContrerasGlz/Automation_Playwright_AI/actions/workflows/playwright.yml)

Mini framework de automatización E2E para [saucedemo.com](https://www.saucedemo.com/) con [Playwright](https://playwright.dev/) y TypeScript, basado en **Page Object Model**, fixtures y datos centralizados.

- **79 tests**: autenticación (20), carrito (27), checkout (25), navegación (6) y el seed de los agentes (1).
- **13 tests de bugs conocidos** de la web, documentados con `test.fail()`.
- **CI** en GitHub Actions, **lint** con reglas específicas de Playwright y **etiquetas** (`@smoke`, `@known-bug`).

> **Sobre la web:** saucedemo es una tienda de práctica de Sauce Labs. Algunos usuarios (`problem_user`, `error_user`, `visual_user`…) tienen fallos **intencionados** para practicar testing; aquí se detectan y documentan, no se "arreglan".

## Índice

- [Inicio rápido](#inicio-rápido)
- [Comandos](#comandos)
- [Etiquetas](#etiquetas)
- [Variables de entorno](#variables-de-entorno)
- [Arquitectura](#arquitectura)
- [Cómo añadir un test](#cómo-añadir-un-test)
- [Calidad del código](#calidad-del-código)
- [Escenarios cubiertos](#escenarios-cubiertos)
- [Bugs conocidos](#bugs-conocidos)
- [Informes y depuración](#informes-y-depuración)
- [Integración continua](#integración-continua-github-actions)
- [Agentes de Playwright (Claude Code)](#agentes-de-playwright-claude-code)

## Inicio rápido

Requisitos: **Node.js 22** (fijado en `.nvmrc`) y npm.

```bash
git clone https://github.com/LuisContrerasGlz/Automation_Playwright_AI.git
cd Automation_Playwright_AI
nvm use                           # opcional, usa la versión de .nvmrc
npm ci                            # instala las dependencias exactas del package-lock
npx playwright install chromium   # descarga el navegador
npm test                          # ejecuta la suite completa (~1 min)
npm run report                    # abre el informe HTML
```

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm test` | Ejecuta todos los tests en modo headless |
| `npm run test:smoke` | Solo los tests `@smoke`: un test por flujo crítico (~10 s) |
| `npm run test:known-bugs` | Solo los tests `@known-bug` (bugs conocidos de la web) |
| `npm run test:headed` | Ejecuta los tests con el navegador visible |
| `npm run test:ui` | Abre el modo UI interactivo de Playwright |
| `npm run report` | Abre el informe HTML de la última ejecución |
| `npm run typecheck` | Comprueba los tipos con TypeScript |
| `npm run lint` / `npm run lint:fix` | Analiza el código con ESLint (y corrige lo automático) |
| `npm run check` | Tipos + lint (recomendado antes de cada push) |

Otras formas útiles de ejecutar:

```bash
npx playwright test tests/cart/inventory.spec.ts   # un fichero
npx playwright test -g "Checkout happy path"       # tests cuyo título contiene el texto
npx playwright test --grep-invert @known-bug       # todo excepto los bugs conocidos
npx playwright test --debug                        # paso a paso con el Inspector
```

## Etiquetas

| Etiqueta | Qué marca |
| --- | --- |
| `@smoke` | 10 tests, uno por flujo crítico: login, carrito, detalle, persistencia, checkout, validación, navegación y control de acceso |
| `@known-bug` | Tests de bugs conocidos de la web, marcados con `test.fail()` |

```ts
test('Checkout happy path with two items completes the order', { tag: '@smoke' }, async ({ ... }) => { ... });
```

ESLint solo admite estas dos etiquetas: una errata como `@smok` falla en el lint.

## Variables de entorno

Todas son opcionales; si no se definen se usan los valores por defecto.

| Variable | Por defecto | Uso |
| --- | --- | --- |
| `BASE_URL` | `https://www.saucedemo.com` | URL base de la aplicación |
| `STANDARD_USER` | `standard_user` | Usuario principal de los tests |
| `STANDARD_PASSWORD` | `secret_sauce` | Contraseña de todos los usuarios |
| `CI` | — | La define GitHub Actions. Activa 2 reintentos, 1 worker, el reporter `github` y prohíbe `test.only` |

```bash
BASE_URL=https://www.saucedemo.com npm test
```

## Arquitectura

Los tests se apoyan en capas; cada una solo usa las de debajo:

```
tests/ (specs)          → qué se prueba: pasos y aserciones
  └─ fixtures/          → inyecta Page Objects y flujos; login automático
      └─ flows/         → flujos de negocio multi-página (p. ej. llegar al checkout)
          └─ pages/ + components/   → cómo interactuar con cada página (localizadores y acciones)
data/ + utils/          → datos de prueba, textos esperados y cálculos (usados por todas las capas)
```

```
├── .github/workflows/            # CI con GitHub Actions
├── playwright.config.ts          # Configuración de Playwright
├── eslint.config.mjs             # Reglas de ESLint (TypeScript + Playwright)
├── tsconfig.json                 # TypeScript estricto + alias @pages, @components, @flows, @fixtures, @data, @utils
├── specs/                        # Planes de prueba (generados con el agente planner)
├── src/
│   ├── components/               # Partes compartidas entre páginas
│   │   ├── HeaderComponent.ts    # Cabecera: carrito, contador y menú lateral
│   │   ├── FooterComponent.ts    # Pie: enlaces sociales y copyright
│   │   └── CartItemsComponent.ts # Lista de productos del carrito y del resumen del checkout
│   ├── pages/                    # Page Objects: localizadores y acciones, sin aserciones
│   │   ├── BasePage.ts           # Base común: header, footer, reload() y waitForLoaded()
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   ├── flows/
│   │   └── CheckoutFlow.ts       # addToCartAndOpenCart, startCheckout, goToOverview, completeOrder
│   ├── fixtures/
│   │   └── pages.fixture.ts      # `test` del proyecto: Page Objects, checkoutFlow y opción `user`
│   ├── data/                     # Datos de prueba y textos esperados
│   │   ├── users.ts              # Usuarios válidos, especiales y no válidos
│   │   ├── products.ts           # Catálogo (nombre y precio)
│   │   ├── customers.ts          # Datos del formulario de checkout
│   │   ├── checkout.ts           # Impuesto y textos del checkout
│   │   ├── messages.ts           # Mensajes de error
│   │   ├── page-titles.ts        # Título de cada página
│   │   ├── routes.ts             # URLs internas y páginas protegidas
│   │   ├── links.ts              # URLs externas (About y redes sociales)
│   │   └── sort-options.ts       # Opciones de ordenación
│   └── utils/
│       ├── pricing.ts            # Totales esperados del checkout (en céntimos, sin errores de redondeo)
│       └── sorting.ts            # Orden esperado según la opción de ordenación
└── tests/
    ├── seed.spec.ts              # Seed de los agentes: deja la sesión iniciada en el inventario
    ├── auth/                     # login, login-validation, logout, access-control
    ├── cart/                     # add-to-cart, inventory, product-detail, cart-page, sorting, persistence, special-users
    ├── checkout/                 # checkout, totals, validation, navigation, known-bugs, special-users-checkout
    └── navigation/               # links, menu
```

## Cómo añadir un test

1. **Importa `test` y `expect` del fixture del proyecto**, no de `@playwright/test`:
   ```ts
   import { test, expect } from '@fixtures/pages.fixture';
   ```
2. **Empieza con la sesión iniciada** con `test.use({ user })`: hace login y espera al inventario. Sin `user`, el test empieza sin sesión.
3. **Usa flujos para llegar al punto de partida** y los Page Objects para el resto:
   ```ts
   import { test, expect } from '@fixtures/pages.fixture';
   import { users } from '@data/users';
   import { products } from '@data/products';
   import { expectedSummary } from '@utils/pricing';

   test.use({ user: users.standard });

   test('Overview shows the correct total', { tag: '@smoke' }, async ({ checkoutFlow, checkoutOverviewPage }) => {
     const items = [products.backpack, products.onesie];

     await checkoutFlow.goToOverview(items);

     await expect(checkoutOverviewPage.total).toHaveText(expectedSummary(items).total);
   });
   ```

**Reglas del proyecto** (la mayoría las comprueba ESLint):

| Regla | Por qué |
| --- | --- |
| Los Page Objects no tienen aserciones; los tests no tienen selectores | Si cambia la web, solo se toca el Page Object |
| Los textos, URLs, usuarios y productos viven en `src/data/` | Un único sitio que actualizar |
| Solo aserciones que reintentan (`toHaveText`, `toBeVisible`…), nunca `waitForTimeout` | Tests estables sin esperas fijas |
| Sin `if` dentro de los tests; los casos parametrizados se escriben con un `for` sobre datos | Cada test hace siempre lo mismo |
| Cada test es independiente (no depende del orden ni de otro test) | Se pueden ejecutar en paralelo |
| Si falta una acción o un localizador, se añade al Page Object o al componente | Reutilizable por todos los tests |
| Un bug de la web se documenta con `test.fail()`, la etiqueta `@known-bug` y una anotación `issue` | Ver [Bugs conocidos](#bugs-conocidos) |

## Calidad del código

- **TypeScript estricto** (`npm run typecheck`).
- **ESLint** (`eslint.config.mjs`) con `typescript-eslint` y el plugin oficial `eslint-plugin-playwright`. Convierte en errores:
  - `await` olvidados en acciones y aserciones (el test pasaría sin comprobar nada);
  - `test.only`, `test.skip`, `page.pause()`, `waitForTimeout`, `force: true`;
  - `if` dentro de los tests, selectores CSS (`page.locator`) y aserciones que no reintentan (`isVisible()` en lugar de `toBeVisible()`);
  - etiquetas no permitidas.
- `npm run check` ejecuta ambos; el CI también.

## Escenarios cubiertos

Planes de prueba detallados en [`specs/add-to-cart.plan.md`](specs/add-to-cart.plan.md) y [`specs/coverage-gaps.plan.md`](specs/coverage-gaps.plan.md).

### Autenticación (`tests/auth`)
| Fichero | Cobertura |
| --- | --- |
| `login.spec.ts` | Login correcto, contraseña errónea y usuario bloqueado |
| `login-validation.spec.ts` | Campos vacíos, usuario inexistente, usuario en mayúsculas y cerrar el mensaje de error |
| `logout.spec.ts` | Logout desde el inventario, el carrito y el checkout: vuelve al login con los campos vacíos y sin cookies |
| `access-control.spec.ts` | Las 6 páginas internas redirigen al login sin sesión; tras el logout, *Atrás* y la URL del checkout no dan acceso |

### Carrito (`tests/cart`)
| Fichero | Cobertura |
| --- | --- |
| `add-to-cart.spec.ts` | Login + añadir la *Sauce Labs Bolt T-Shirt* |
| `inventory.spec.ts` | Añadir varios/todos, quitar, contador a 0, volver a añadir |
| `product-detail.spec.ts` | Añadir/quitar desde el detalle y coherencia con el inventario |
| `cart-page.spec.ts` | Contenido (nombre, precio, cantidad), carrito vacío, quitar, *Continue Shopping*, abrir detalle |
| `sorting.spec.ts` | Añadir tras ordenar y carrito intacto al cambiar el orden |
| `persistence.spec.ts` | Recarga, logout/login, *Reset App State*, navegación entre páginas |
| `special-users.spec.ts` | `problem_user` y `error_user` al añadir y quitar productos |

### Checkout (`tests/checkout`)
| Fichero | Cobertura |
| --- | --- |
| `checkout.spec.ts` | Compra completa paso a paso, resumen tras quitar un producto, carrito vacío tras terminar y *Back Home* |
| `checkout-totals.spec.ts` | Subtotal, impuesto (8%) y total para varios conjuntos de productos |
| `checkout-validation.spec.ts` | Campos obligatorios, cerrar el error conserva los datos, *Cancel* conserva el carrito |
| `checkout-navigation.spec.ts` | *Cancel* en el paso 1 vuelve al carrito; en el paso 2 vuelve al inventario sin vaciar el carrito |
| `checkout-known-bugs.spec.ts` | Formulario, carrito vacío y acceso directo por URL |
| `special-users-checkout.spec.ts` | `visual_user`, `problem_user`, `error_user` y `performance_glitch_user` |

### Navegación (`tests/navigation`)
| Fichero | Cobertura |
| --- | --- |
| `links.spec.ts` | Los enlaces del pie (X, Facebook, LinkedIn) y *About* apuntan a la URL correcta (se comprueba el `href` sin salir a webs externas) |
| `menu.spec.ts` | *All Items* desde el carrito vuelve al inventario; el menú se abre y se cierra |

## Bugs conocidos

Estos tests comprueban el comportamiento **correcto** y están marcados con `test.fail()`, la etiqueta `@known-bug` y una anotación `issue`:
- **Mientras el bug exista**, el test falla como se espera y cuenta como pasado: la suite queda en verde.
- **Si la web se corrige**, el test pasa de repente y Playwright lo marca como fallo, para avisar de que hay que quitar la marca.
- En el informe HTML cada uno muestra su anotación, el error recibido frente al esperado y una captura.

| ID | Bug | Test |
| --- | --- | --- |
| KB-1 | El subtotal no se redondea: *"Item total: $57.980000000000004"* (Onesie + Fleece Jacket) | `checkout/checkout-totals.spec.ts` |
| KB-2 | Se puede completar una compra con el carrito vacío | `checkout/checkout-known-bugs.spec.ts` |
| KB-3 | El formulario acepta nombres de solo espacios y un código postal `abc!@#` | `checkout/checkout-known-bugs.spec.ts` |
| KB-4 | Con sesión iniciada, el resumen y la confirmación se abren por URL directa | `checkout/checkout-known-bugs.spec.ts` |
| KB-5 | `visual_user` ve precios aleatorios en el inventario (el carrito y el checkout usan los reales) | `checkout/special-users-checkout.spec.ts` |
| KB-6 | `problem_user`: en el checkout el apellido se escribe en el campo del nombre | `checkout/special-users-checkout.spec.ts` |
| KB-7 | `error_user`: *Finish* no completa el pedido (error JavaScript) | `checkout/special-users-checkout.spec.ts` |
| — | *Reset App State* no devuelve los botones a *Add to cart* hasta recargar | `cart/persistence.spec.ts` |
| — | `problem_user` / `error_user`: solo se añaden 3 de los 6 productos y *Remove* no funciona | `cart/special-users.spec.ts` |

## Informes y depuración

- **Informe HTML:** se genera en `playwright-report/` en cada ejecución; ábrelo con `npm run report`.
- **Artefactos de fallos** en `test-results/`: captura y vídeo de cada test fallido.
- **Trazas** (línea de tiempo con DOM, red y consola): se graban en el primer reintento, así que en el CI salen solas (artefacto `test-results`). En local no hay reintentos; para grabarlas usa `npx playwright test --trace on` y ábrelas con `npx playwright show-trace test-results/<carpeta>/trace.zip`.
- **Depurar:** `npm run test:ui` (modo interactivo) o `npx playwright test --debug` (Inspector paso a paso).

## Integración continua (GitHub Actions)

El workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) ejecuta la suite:

| Cuándo | Para qué |
| --- | --- |
| Cada push a `main` y cada pull request | Detectar regresiones |
| De lunes a viernes a las 06:00 UTC | La web es de terceros: detecta cambios en ella (y bugs conocidos que se corrijan) |
| Manualmente (*Run workflow*) | Ejecutarla bajo demanda |

**Pasos:** `npm ci` → tipos → lint → instala Chromium → tests → sube el informe HTML (`playwright-report`, 14 días). Si algo falla, sube también trazas, capturas y vídeos (`test-results`, 7 días).

**Buenas prácticas aplicadas:** permisos mínimos (`contents: read`), acciones fijadas a un commit (SHA), caché de npm, versión de Node compartida con local (`.nvmrc`), `timeout-minutes`, cancelación de ejecuciones obsoletas y anotaciones de fallos (reporter `github`).

**Ver el informe de una ejecución:** pestaña *Actions* → ejecución → *Artifacts* → descargar `playwright-report` → descomprimir y ejecutar `npx playwright show-report <carpeta>`.

## Agentes de Playwright (Claude Code)

El proyecto incluye los agentes de Playwright para [Claude Code](https://claude.com/claude-code), generados con `npx playwright init-agents --loop=claude`:

| Agente | Función |
| --- | --- |
| `playwright-test-planner` | Explora la web y guarda planes de prueba en `specs/` |
| `playwright-test-generator` | Genera tests a partir de un plan |
| `playwright-test-healer` | Ejecuta la suite, depura y corrige tests que fallan |

- **Configuración:** definiciones en `.claude/agents/` y servidor MCP `playwright-test` en `.mcp.json`. Al abrir el proyecto, Claude Code pide aprobar el servidor.
- **Uso:** pídeselo a Claude por su nombre, por ejemplo: *"usa el agente playwright-test-planner para crear un plan de pruebas del checkout"*.
- **Seed:** `tests/seed.spec.ts` deja la sesión iniciada como `standard_user` en el inventario; los agentes lo ejecutan para preparar la página.
- El código generado por los agentes se revisa y adapta a las [reglas del proyecto](#cómo-añadir-un-test) antes de integrarlo.
