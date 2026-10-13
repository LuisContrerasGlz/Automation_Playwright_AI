# SauceDemo · Playwright + TypeScript

Tests E2E para [saucedemo.com](https://www.saucedemo.com/) con [Playwright](https://playwright.dev/) y TypeScript, siguiendo el patrón **Page Object Model (POM)**.

## Requisitos

- Node.js 18 o superior (probado con Node 22)
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
├── playwright.config.ts      # Configuración de Playwright
├── tsconfig.json             # TypeScript estricto + alias @pages, @fixtures, @data
├── src/
│   ├── pages/                # Page Objects (localizadores y acciones, sin aserciones)
│   │   ├── LoginPage.ts
│   │   └── InventoryPage.ts
│   ├── fixtures/
│   │   └── pages.fixture.ts  # Inyecta los Page Objects en los tests
│   └── data/                 # Datos de prueba
│       ├── users.ts
│       └── products.ts
└── tests/
    └── cart/
        └── add-to-cart.spec.ts
```

## Escenarios

- **Cart › standard user can add a t-shirt to the cart**: inicia sesión con `standard_user`, añade la *Sauce Labs Bolt T-Shirt* al carrito y verifica que el contador del carrito muestra `1` y que el botón cambia a *Remove*.

## Informes y artefactos

- Informe HTML: `playwright-report/` (abrir con `npm run report`).
- En caso de fallo se guardan capturas y vídeo en `test-results/`; la traza se genera en el primer reintento.
