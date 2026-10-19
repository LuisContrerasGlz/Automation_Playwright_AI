# SauceDemo · Playwright + TypeScript

[![Playwright Tests](https://github.com/LuisContrerasGlz/Automation_Playwright_AI/actions/workflows/playwright.yml/badge.svg)](https://github.com/LuisContrerasGlz/Automation_Playwright_AI/actions/workflows/playwright.yml)

Tests E2E para [saucedemo.com](https://www.saucedemo.com/) con [Playwright](https://playwright.dev/) y TypeScript, siguiendo el patrón **Page Object Model (POM)**.

## Requisitos

- Node.js 22 (versión fijada en `.nvmrc`; con nvm: `nvm use`)
- npm

## Instalación

```bash
npm install
npx playwright install chromium
```

## Ejecución

| Comando | Descripción |
| --- | --- |
| `npm test` | Ejecuta todos los tests en modo headless |
| `npm run test:headed` | Ejecuta los tests con el navegador visible |
| `npm run test:ui` | Abre el modo UI interactivo de Playwright |
| `npm run report` | Abre el informe HTML de la última ejecución |
| `npm run typecheck` | Comprueba los tipos con TypeScript |

Ejecutar un test concreto:

```bash
npx playwright test tests/cart/add-to-cart.spec.ts
```

Depurar paso a paso con el Inspector:

```bash
npx playwright test --debug
```

## Variables de entorno

Todas son opcionales; si no se definen se usan los valores por defecto.

| Variable | Por defecto | Uso |
| --- | --- | --- |
| `BASE_URL` | `https://www.saucedemo.com` | URL base de la aplicación |
| `STANDARD_USER` | `standard_user` | Usuario del login |
| `STANDARD_PASSWORD` | `secret_sauce` | Contraseña del login |
| `CI` | — | Si está definida: 2 reintentos, 1 worker y se prohíbe `test.only` |

Ejemplo:

```bash
BASE_URL=https://www.saucedemo.com npm test
```

## Estructura

```
├── playwright.config.ts          # Configuración de Playwright
├── tsconfig.json                 # TypeScript estricto + alias @pages, @components, @flows, @fixtures, @data, @utils
├── specs/                        # Planes de prueba (generados con el agente planner)
├── src/
│   ├── components/
│   │   ├── HeaderComponent.ts    # Cabecera compartida: carrito, contador y menú lateral
│   │   ├── FooterComponent.ts    # Pie compartido: enlaces sociales y copyright
│   │   └── CartItemsComponent.ts # Lista de productos compartida por carrito y resumen del checkout
│   ├── pages/                    # Page Objects (localizadores y acciones, sin aserciones)
│   │   ├── BasePage.ts           # Base común: header, reload() y waitForLoaded()
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   ├── flows/
│   │   └── CheckoutFlow.ts       # Flujos de negocio multi-página (llegar al checkout, al resumen, completar pedido)
│   ├── fixtures/
│   │   └── pages.fixture.ts      # Inyecta los Page Objects y hace login automático (opción `user`)
│   ├── data/                     # Datos de prueba
│   │   ├── users.ts
│   │   ├── products.ts           # Catálogo (nombre y precio)
│   │   ├── sort-options.ts
│   │   ├── customers.ts          # Datos del formulario de checkout
│   │   ├── checkout.ts           # Impuesto y textos del checkout
│   │   ├── page-titles.ts        # Título de cada página
│   │   ├── links.ts              # URLs externas (About y redes sociales)
│   │   ├── routes.ts             # URLs y páginas protegidas
│   │   └── messages.ts           # Mensajes de error esperados
│   └── utils/
│       ├── sorting.ts            # Orden esperado según la opción de ordenación
│       └── pricing.ts            # Totales esperados del checkout (subtotal, impuesto, total)
└── tests/
    ├── seed.spec.ts              # Seed para los agentes de Playwright
    ├── auth/
    │   ├── login.spec.ts
    │   ├── login-validation.spec.ts
    │   ├── logout.spec.ts
    │   └── access-control.spec.ts
    ├── checkout/
    │   ├── checkout.spec.ts
    │   ├── checkout-totals.spec.ts
    │   ├── checkout-validation.spec.ts
    │   ├── checkout-navigation.spec.ts
    │   ├── checkout-known-bugs.spec.ts
    │   └── special-users-checkout.spec.ts
    ├── navigation/
    │   ├── links.spec.ts
    │   └── menu.spec.ts
    └── cart/
        ├── add-to-cart.spec.ts
        ├── inventory.spec.ts
        ├── product-detail.spec.ts
        ├── cart-page.spec.ts
        ├── sorting.spec.ts
        ├── persistence.spec.ts
        └── special-users.spec.ts
```

### Empezar un test con la sesión iniciada

```ts
import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';

test.use({ user: users.standard }); // login automático y espera al inventario

test('...', async ({ inventoryPage, cartPage }) => { /* ... */ });
```

## Escenarios

### Login (`tests/auth`)
- **standard user can log in with valid credentials**: llega al inventario (*Products*) sin mensaje de error.
- **login fails with wrong password**: error *"Username and password do not match any user in this service"*.
- **login fails with locked out user**: error *"Sorry, this user has been locked out."*.
- **Login validation** (`login-validation.spec.ts`): campos vacíos, usuario inexistente, usuario en mayúsculas y cerrar el mensaje de error.
- **Logout** (`logout.spec.ts`): desde el inventario, el carrito y el checkout vuelve al login con los campos vacíos y sin cookies.
- **Access control** (`access-control.spec.ts`): las 6 páginas internas redirigen al login sin sesión; tras el logout, *Atrás* y la URL del checkout no dan acceso.

### Checkout (`tests/checkout`, plan en `specs/coverage-gaps.plan.md`)
| Fichero | Cobertura |
| --- | --- |
| `checkout.spec.ts` | Compra completa paso a paso, resumen tras quitar un producto, carrito vacío tras terminar y *Back Home* |
| `checkout-totals.spec.ts` | Subtotal, impuesto (8%) y total para varios conjuntos de productos |
| `checkout-validation.spec.ts` | Campos obligatorios, cerrar el error conserva los datos, *Cancel* conserva el carrito |
| `checkout-navigation.spec.ts` | *Cancel* en el paso 1 vuelve al carrito; en el paso 2 vuelve al inventario sin vaciar el carrito |
| `checkout-known-bugs.spec.ts` | Bugs conocidos del formulario, del carrito vacío y del acceso directo por URL |
| `special-users-checkout.spec.ts` | `visual_user`, `problem_user`, `error_user` y `performance_glitch_user` en el checkout |

### Navegación (`tests/navigation`)
- **links.spec.ts**: los enlaces del pie (X, Facebook, LinkedIn) y *About* apuntan a la URL correcta; se comprueba el `href` sin navegar a webs externas.
- **menu.spec.ts**: *All Items* desde el carrito vuelve al inventario; el menú se abre y se cierra.

### Carrito (`tests/cart`, plan en `specs/add-to-cart.plan.md`)
| Fichero | Cobertura |
| --- | --- |
| `add-to-cart.spec.ts` | Login + añadir la *Sauce Labs Bolt T-Shirt* |
| `inventory.spec.ts` | Añadir varios/todos, quitar, contador a 0, volver a añadir |
| `product-detail.spec.ts` | Añadir/quitar desde el detalle y coherencia con el inventario |
| `cart-page.spec.ts` | Contenido (nombre, precio, cantidad), carrito vacío, quitar, Continue Shopping, abrir detalle |
| `sorting.spec.ts` | Añadir tras ordenar y carrito intacto al cambiar el orden |
| `persistence.spec.ts` | Recarga, logout/login, Reset App State, navegación entre páginas |
| `special-users.spec.ts` | `problem_user` y `error_user` |

### Bugs conocidos (`test.fail()`)
Estos tests comprueban el comportamiento **correcto** y están marcados con `test.fail()` y una anotación `issue`, porque la web tiene el bug. Si un día se corrige, Playwright los marcará como fallo para que se quite la marca.
- *Reset App State* no devuelve los botones a *Add to cart* hasta recargar la página.
- `problem_user` / `error_user`: solo se añaden 3 de los 6 productos y *Remove* no funciona.
- El subtotal del checkout no se redondea: *"Item total: $57.980000000000004"* (Onesie + Fleece Jacket).
- El formulario de checkout acepta nombres de solo espacios y un código postal `abc!@#`.
- Se puede completar una compra con el carrito vacío.
- Con sesión iniciada, el resumen y la confirmación del pedido se abren por URL directa sin pasar por el checkout.
- `visual_user` ve precios aleatorios en el inventario (el carrito y el checkout usan los reales).
- `problem_user`: en el checkout, el apellido se escribe en el campo del nombre.
- `error_user`: *Finish* no completa el pedido (error JavaScript).

## Integración continua (GitHub Actions)

El workflow `.github/workflows/playwright.yml` ejecuta la suite:

| Cuándo | Para qué |
| --- | --- |
| Cada push a `main` y cada pull request | Detectar regresiones antes de integrar |
| De lunes a viernes a las 06:00 UTC | La web es de terceros: detecta cambios en ella (y bugs conocidos que se corrijan) |
| Manualmente (*Run workflow*) | Ejecutarla bajo demanda |

Pasos: instala dependencias (`npm ci`), comprueba tipos, instala Chromium, ejecuta los tests y sube el informe HTML como artefacto (`playwright-report`, 14 días). Si algo falla, sube también trazas, capturas y vídeos (`test-results`, 7 días).

Buenas prácticas aplicadas: permisos mínimos (`contents: read`), acciones fijadas a un commit (SHA), caché de npm, versión de Node compartida con local (`.nvmrc`), `timeout-minutes`, cancelación de ejecuciones obsoletas y anotaciones de fallos en el PR (reporter `github`).

**Ver el informe de una ejecución:** pestaña *Actions* → ejecución → *Artifacts* → descargar `playwright-report` → descomprimir y ejecutar `npx playwright show-report <carpeta>`.

## Agentes de Playwright (Claude Code)

El proyecto incluye los agentes de Playwright generados con `npx playwright init-agents --loop=claude`:

| Agente | Función |
| --- | --- |
| `playwright-test-planner` | Explora la web y guarda planes de prueba en `specs/` |
| `playwright-test-generator` | Genera tests a partir de un plan |
| `playwright-test-healer` | Depura y corrige tests que fallan |

- Definiciones en `.claude/agents/` y servidor MCP `playwright-test` en `.mcp.json` (Claude Code pide aprobarlo al abrir el proyecto).
- `tests/seed.spec.ts` es el test semilla: los agentes lo ejecutan para preparar la página (abre el login usando los fixtures del proyecto).

## Informes y artefactos

- Informe HTML: `playwright-report/` (abrir con `npm run report`).
- En caso de fallo se guardan capturas y vídeo en `test-results/`; la traza se genera en el primer reintento.
