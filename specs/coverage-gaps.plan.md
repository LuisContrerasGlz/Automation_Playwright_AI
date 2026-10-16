# Plan de cobertura faltante - saucedemo.com (checkout, validaciones, acceso y usuarios especiales)

## Application Overview

Plan priorizado de pruebas que complementan la suite existente (login valido/password erroneo/locked_out_user y toda el area add-to-cart). NO se replanifica lo ya cubierto. Todos los datos (textos, URLs, data-test) fueron observados en vivo el 2026-10-15 con standard_user salvo que se indique "INFERIDO". Credenciales: password `secret_sauce` para todos los usuarios. Estado inicial de cada escenario: sesion limpia (sin cookies/localStorage), carrito vacio. Datos de checkout validos: First Name `John`, Last Name `Doe`, Zip `12345`. NOTA TECNICA: la app renderiza con retraso tras navegar; usar aserciones con auto-wait (expect(...).toHaveURL / toHaveText), nunca leer textos inmediatamente despues de click.

Locators observados (data-test): login: `username`, `password`, `login-button`, `error`, `error-button`. Menu: `open-menu`, `logout-sidebar-link`, `reset-sidebar-link`. Carrito: `shopping-cart-link`, `shopping-cart-badge`, `checkout`, `continue-shopping`, `remove-<slug>`. Paso 1: `firstName`, `lastName`, `postalCode`, `cancel`, `continue`, `error`, `error-button`. Paso 2 (overview): `inventory-item`, `inventory-item-name`, `inventory-item-price`, `payment-info-label/value`, `shipping-info-label/value`, `total-info-label`, `subtotal-label`, `tax-label`, `total-label`, `cancel`, `finish`. Completado: `checkout-complete-container`, `complete-header`, `complete-text`, `back-to-products`, `generate-pdf-order`, `title`.

URLs: /cart.html, /checkout-step-one.html (titulo "Checkout: Your Information"), /checkout-step-two.html (titulo "Checkout: Overview"), /checkout-complete.html (titulo "Checkout: Complete!").

Precios: Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99. Impuesto observado = 8% del subtotal (39.98 -> 3.20; 57.98 -> 4.64).

BUGS CONOCIDOS OBSERVADOS (marcar test.fail()/annotation 'known bug'): (KB-1) Item total sin redondear en Overview: "Item total: $57.980000000000004" con Onesie + Fleece Jacket. (KB-2) El checkout permite carrito vacio: Checkout lleva a step-one, completa overview con "Item total: $0 / Tax: $0.00 / Total: $0.00" y Finish llega a "Checkout: Complete!". (KB-3) Los campos aceptan solo espacios (' ') como nombre/apellido y caracteres raros en zip. (KB-4) Con sesion iniciada, abrir directamente /checkout-step-two.html y /checkout-complete.html se permite sin pasar por el flujo. (KB-5) visual_user muestra precios en inventario distintos a los reales y botones desplazados (ver P3). (KB-6) problem_user: el texto de Last Name se escribe en First Name y Last Name queda vacio; Continue muestra "Error: Last Name is required". (KB-7) error_user: Last Name no acepta texto, la validacion no lo detecta y Finish no completa la orden (error JS en consola).

## Test Scenarios

### 1. P1 - Critico: Checkout (flujo feliz y totales)

**Seed:** `tests/seed.spec.ts`

#### 1.1. [P1] Checkout happy path with two items completes the order

**File:** `tests/checkout/checkout-happy-path.spec.ts`

**Steps:**
  1. Precondicion: login standard_user. Agregar Sauce Labs Backpack y Sauce Labs Bike Light (`add-to-cart-sauce-labs-backpack`, `add-to-cart-sauce-labs-bike-light`). Click en `shopping-cart-link`, click en `checkout`.
    - expect: URL https://www.saucedemo.com/checkout-step-one.html, titulo `Checkout: Your Information`
    - expect: Placeholders: `First Name`, `Last Name`, `Zip/Postal Code`; botones `cancel` y `continue`
  2. Llenar firstName=John, lastName=Doe, postalCode=12345 y click en `continue`.
    - expect: URL /checkout-step-two.html, titulo `Checkout: Overview`
    - expect: Lista con 2 items (cantidad 1, nombre, descripcion y precio igual a inventario)
    - expect: `Payment Information:` = `SauceCard #31337`; `Shipping Information:` = `Free Pony Express Delivery!`
  3. Click en `finish`.
    - expect: URL /checkout-complete.html, titulo `Checkout: Complete!`
    - expect: `complete-header` = `Thank you for your order!`
    - expect: `complete-text` = `Your order has been dispatched, and will arrive just as fast as the pony can get there!`
    - expect: Boton `back-to-products` (texto `Back Home`) y `generate-pdf-order` (texto `Generate PDF order`) visibles
    - expect: Badge del carrito (`shopping-cart-badge`) ya no existe (carrito vaciado)

#### 1.2. [P1] Overview totals: item total equals sum of prices, tax 8%, total = item total + tax

**File:** `tests/checkout/checkout-totals.spec.ts`

**Steps:**
  1. Precondicion: login standard_user. Agregar Backpack ($29.99) y Bike Light ($9.99); ir a Overview con datos validos.
    - expect: `Item total: $39.98`
    - expect: `Tax: $3.20`
    - expect: `Total: $43.18`
  2. Repetir (escenario parametrizado) con: un solo producto (Onesie $7.99 -> esperar item total 7.99, tax 0.64, total 8.63 - INFERIDO por 8%), los 6 productos (suma 129.94 INFERIDO, tax = round(8%)), y Bolt T-Shirt + Red T-Shirt (ambos $15.99).
    - expect: El test calcula la suma desde los precios mostrados en Overview y verifica item total, tax=round(item*0.08,2) y total=item+tax
    - expect: Los precios de Overview coinciden con los del inventario
  3. KNOWN BUG KB-1: Agregar Sauce Labs Onesie ($7.99) + Sauce Labs Fleece Jacket ($49.99) y llegar a Overview.
    - expect: Observado: `Item total: $57.980000000000004`, `Tax: $4.64`, `Total: $62.62`. Esperado correcto: `Item total: $57.98`. Marcar con test.fail() / anotacion de bug conocido

#### 1.3. [P1] Overview lists only the items in the cart after removing one from the cart page

**File:** `tests/checkout/checkout-happy-path.spec.ts`

**Steps:**
  1. Agregar 3 productos, en /cart.html eliminar uno (`remove-<slug>`), continuar checkout con datos validos.
    - expect: Overview muestra solo los 2 restantes y los totales se recalculan acorde

#### 1.4. [P1] Cart is emptied and order cannot be repeated after finishing checkout

**File:** `tests/checkout/checkout-happy-path.spec.ts`

**Steps:**
  1. Completar un pedido; click en `back-to-products` (`Back Home`).
    - expect: URL /inventory.html; sin badge; todos los botones muestran `Add to cart`
  2. Abrir /cart.html.
    - expect: Lista vacia

### 2. P1 - Critico: Validacion del formulario de checkout

**Seed:** `tests/seed.spec.ts`

#### 2.1. [P1] Checkout step one shows required-field errors for each empty field

**File:** `tests/checkout/checkout-validation.spec.ts`

**Steps:**
  1. Precondicion: standard_user con 1 producto en el carrito, ir a /checkout-step-one.html via `checkout`. Click en `continue` con los tres campos vacios.
    - expect: `error` visible con texto exacto `Error: First Name is required`; permanece en /checkout-step-one.html
  2. Dejar firstName vacio; lastName=Doe, postalCode=12345; click `continue`.
    - expect: `Error: First Name is required`
  3. firstName=John, lastName vacio, postalCode=12345; click `continue`.
    - expect: `Error: Last Name is required`
  4. firstName=John, lastName=Doe, postalCode vacio; click `continue`.
    - expect: `Error: Postal Code is required`
  5. Click en `error-button` (X del mensaje).
    - expect: El mensaje `error` desaparece (count 0) y los valores ingresados se conservan - conservacion INFERIDO, solo se verifico que desaparece
  6. Corregir el campo faltante y click `continue`.
    - expect: Avanza a /checkout-step-two.html

#### 2.2. [P1] Checkout does not lose cart contents after a validation error

**File:** `tests/checkout/checkout-validation.spec.ts`

**Steps:**
  1. Provocar error de validacion, luego click en `cancel`.
    - expect: Vuelve a /cart.html con los mismos items y badge intacto

#### 2.3. [P1] Known bug: checkout accepts whitespace-only names and empty cart

**File:** `tests/checkout/checkout-known-bugs.spec.ts`

**Steps:**
  1. KB-3: firstName=' ', lastName=' ', postalCode='abc!@#', click `continue`.
    - expect: Observado: avanza a /checkout-step-two.html (no hay validacion de espacios/formato). Esperado correcto: mostrar error. Marcar test.fail()
  2. KB-2: Con carrito vacio abrir /cart.html, click `checkout`, llenar datos validos, `continue`, `finish`.
    - expect: Observado: /checkout-step-one.html permitido, Overview con `Item total: $0`, `Tax: $0.00`, `Total: $0.00`, y Finish llega a `Checkout: Complete!`. Esperado correcto: bloquear checkout vacio. Marcar test.fail()

### 3. P1 - Critico: Control de acceso

**Seed:** `tests/seed.spec.ts`

#### 3.1. [P1] Protected pages redirect to login when not authenticated

**File:** `tests/auth/access-control.spec.ts`

**Steps:**
  1. Precondicion: contexto sin sesion. Abrir directamente cada URL: /inventory.html, /cart.html, /checkout-step-one.html, /checkout-step-two.html, /checkout-complete.html, /inventory-item.html?id=4.
    - expect: Siempre redirige a https://www.saucedemo.com/ (pantalla de login)
    - expect: `error` muestra respectivamente: `Epic sadface: You can only access '/inventory.html' when you are logged in.` (analogo con '/cart.html', '/checkout-step-one.html', '/checkout-step-two.html', '/checkout-complete.html', '/inventory-item.html' - sin query string)

#### 3.2. [P1] After logout, browser Back does not expose the inventory

**File:** `tests/auth/access-control.spec.ts`

**Steps:**
  1. Login standard_user, abrir menu (`open-menu`), click `logout-sidebar-link`, luego page.goBack().
    - expect: Queda en https://www.saucedemo.com/ con `Epic sadface: You can only access '/inventory.html' when you are logged in.`; no se renderiza ningun `inventory-item` (count 0)

#### 3.3. [P1] Session cannot be reused across checkout pages after logout

**File:** `tests/auth/access-control.spec.ts`

**Steps:**
  1. Login, agregar producto, ir a checkout step one, abrir menu y Logout, luego abrir /checkout-step-one.html directamente.
    - expect: Redirige a login con `Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.`

### 4. P2 - Importante: Validaciones de login, logout y navegacion de checkout

**Seed:** `tests/seed.spec.ts`

#### 4.1. [P2] Login with empty username and empty password

**File:** `tests/auth/login-validation.spec.ts`

**Steps:**
  1. En / dejar ambos campos vacios y click `login-button`.
    - expect: `Epic sadface: Username is required`
  2. Solo password=secret_sauce, username vacio, click login.
    - expect: `Epic sadface: Username is required`
  3. Solo username=standard_user, password vacio, click login.
    - expect: `Epic sadface: Password is required`

#### 4.2. [P2] Login error banner can be dismissed with the X button

**File:** `tests/auth/login-validation.spec.ts`

**Steps:**
  1. Provocar error de login y click `error-button`.
    - expect: `error` deja de existir (count 0); campos siguen editables

#### 4.3. [P2] Login rejects unknown user and wrong-case username

**File:** `tests/auth/login-validation.spec.ts`

**Steps:**
  1. username=nouser/password=x; luego username=STANDARD_USER/password=secret_sauce.
    - expect: Ambos: `Epic sadface: Username and password do not match any user in this service` (el username es case-sensitive)

#### 4.4. [P2] Logout from the menu returns to the login page

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Login standard_user; click `open-menu`; click `logout-sidebar-link`.
    - expect: URL https://www.saucedemo.com/; campos username y password vacios; sin cookies de sesion (cookies = [])
  2. Repetir logout desde /cart.html y desde /checkout-step-one.html.
    - expect: Mismo resultado - el menu y Logout estan disponibles en todas las paginas (data-test del menu presentes en cart y checkout) 

#### 4.5. [P2] Cancel buttons navigate to the correct page at each checkout step

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Con 2 productos en carrito, ir a step one y click `cancel`.
    - expect: Vuelve a /cart.html, titulo `Your Cart`, items intactos
  2. Ir a step two (datos validos) y click `cancel`.
    - expect: Vuelve a /inventory.html (titulo `Products`) - observado; badge sigue en `2`, carrito NO se vacia

#### 4.6. [P2] Back Home after order returns to inventory

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Completar pedido y click `back-to-products`.
    - expect: URL /inventory.html, titulo `Products`

#### 4.7. [P2] Direct URL access to checkout steps while logged in (known behaviour)

**File:** `tests/checkout/checkout-known-bugs.spec.ts`

**Steps:**
  1. KB-4: Logueado con carrito vacio, abrir /checkout-step-two.html y /checkout-complete.html directamente.
    - expect: Observado: ambas cargan (`Checkout: Overview` y `Checkout: Complete!`) sin pasar por el flujo. Esperado correcto: redirigir. Marcar test.fail()

### 5. P3 - Deseable: Usuarios especiales y otros

**Seed:** `tests/seed.spec.ts`

#### 5.1. [P3] visual_user checkout totals match but inventory shows altered prices (known bug)

**File:** `tests/checkout/special-users-checkout.spec.ts`

**Steps:**
  1. Login visual_user, leer precios del inventario.
    - expect: Observado: `$57.9, $36.71, $44.27, $28.26, $7.84, $12.68` en lugar de $29.99/$9.99/$15.99/$49.99/$7.99/$15.99 (el orden de ese array es el del DOM); botones Add to cart con posiciones distintas (el ultimo en x=1029 vs 975/420) y carrito en x=1034. Marcar KB-5
  2. Agregar Backpack y Bike Light, completar checkout.
    - expect: Overview `Item total: $39.98`, `Tax: $3.20`, `Total: $43.18` (usa precios reales, inconsistente con inventario); llega a `Checkout: Complete!`

#### 5.2. [P3] problem_user cannot enter last name in checkout (known bug)

**File:** `tests/checkout/special-users-checkout.spec.ts`

**Steps:**
  1. Login problem_user, agregar Backpack y Bike Light, ir a checkout, escribir firstName=John, lastName=Doe, postalCode=12345.
    - expect: Verificado: valores de los campos = [`Doe`, ``, `12345`] (el lastName se escribe en First Name y reemplaza a John; Last Name queda vacio). Marcar KB-6
    - expect: Verificado: al pulsar Continue se muestra `Error: Last Name is required` y no se avanza a step-two

#### 5.3. [P3] error_user cannot complete checkout (known bug)

**File:** `tests/checkout/special-users-checkout.spec.ts`

**Steps:**
  1. Login error_user, agregar 2 productos, ir a checkout, llenar los 3 campos y continuar, luego Finish.
    - expect: Verificado: Last Name no acepta texto (valor ``) pero la validacion no lo marca y se llega a /checkout-step-two.html (KB-7)
    - expect: Verificado: Finish no hace nada; la URL sigue en /checkout-step-two.html y la consola muestra un error JS (`... is not a function`). Marcar como known bug (KB-7)

#### 5.4. [P3] performance_glitch_user can complete the full flow

**File:** `tests/checkout/special-users-checkout.spec.ts`

**Steps:**
  1. Login performance_glitch_user con timeout amplio (>=15s) y completar flujo de compra.
    - expect: Observado en una ejecucion: login a inventory y checkout completo con `Item total: $39.98 / Tax: $3.20 / Total: $43.18` y `Checkout: Complete!`. En otra ejecucion el primer click fallo por timeout de 5s: la lentitud es intermitente, no se pudo cuantificar. Aserciones de tiempo NO deben usarse como criterio fiable

#### 5.5. [P3] Footer and menu external links point to expected URLs

**File:** `tests/navigation/links.spec.ts`

**Steps:**
  1. Verificar atributo href sin navegar: About -> https://saucelabs.com/, `social-x` -> https://x.com/saucelabs, `social-facebook` -> https://www.facebook.com/saucelabs, `social-linkedin` -> https://www.linkedin.com/company/sauce-labs/.
    - expect: Los href coinciden exactamente

#### 5.6. [P3] Menu All Items link and Close Menu

**File:** `tests/navigation/menu.spec.ts`

**Steps:**
  1. Desde /cart.html abrir menu y click en `inventory-sidebar-link` (`All Items`); abrir menu y click `close-menu`. INFERIDO: el comportamiento exacto no fue ejecutado.
    - expect: All Items lleva a /inventory.html; Close Menu cierra el panel. Existe tambien un item `Dynamic Catalog` (`dynamic-catalog-sidebar-link`) no explorado
