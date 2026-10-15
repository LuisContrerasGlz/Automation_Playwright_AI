# Plan de pruebas: Add to cart (SauceDemo)

## Application Overview

Plan de pruebas para la funcionalidad "agregar productos al carrito" de https://www.saucedemo.com/, partiendo de /inventory.html. Precondicion comun de todos los escenarios: sesion iniciada como standard_user / secret_sauce en /inventory.html con estado fresco (carrito vacio). Locators por data-test (testIdAttribute='data-test'). Productos (id de boton add-to-cart-<slug>, remove-<slug>): Sauce Labs Backpack $29.99 (sauce-labs-backpack, link item-4-*), Sauce Labs Bike Light $9.99 (sauce-labs-bike-light, item-0), Sauce Labs Bolt T-Shirt $15.99 (sauce-labs-bolt-t-shirt, item-1), Sauce Labs Fleece Jacket $49.99 (sauce-labs-fleece-jacket, item-5), Sauce Labs Onesie $7.99 (sauce-labs-onesie, item-2), Test.allTheThings() T-Shirt (Red) $15.99 (test.allthethings()-t-shirt-(red), item-3). Otros locators: inventory-item, inventory-item-name, inventory-item-price, shopping-cart-link, shopping-cart-badge, product-sort-container (az, za, lohi, hilo), back-to-products, remove (en detalle), cart-list, item-quantity, continue-shopping, checkout, open-menu, logout-sidebar-link, reset-sidebar-link. Ya cubierto por tests/cart/add-to-cart.spec.ts: standard_user agrega "Sauce Labs Bolt T-Shirt", badge "1" y boton Remove (escenario 1.1 marcado como YA CUBIERTO). El login NO se replanifica (tests/auth/login.spec.ts).

## Test Scenarios

### 1. 1. Inventario: agregar y quitar productos

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add one product from inventory (YA CUBIERTO)

**File:** `tests/cart/add-to-cart.spec.ts`

**Steps:**
  1. Hacer clic en add-to-cart-sauce-labs-bolt-t-shirt
    - expect: El badge shopping-cart-badge muestra '1'
    - expect: El boton cambia de 'Add to cart' a 'Remove' (remove-sauce-labs-bolt-t-shirt)
    - expect: Ya implementado; no duplicar

#### 1.2. Add several products and verify badge count

**File:** `tests/cart/inventory-add-several.spec.ts`

**Steps:**
  1. Agregar Sauce Labs Backpack y Sauce Labs Bike Light en ese orden
    - expect: Badge muestra '2' (observado)
    - expect: Ambos botones muestran 'Remove'; los demas siguen en 'Add to cart'
  2. Agregar un tercer producto (Onesie)
    - expect: Badge muestra '3'

#### 1.3. Add all 6 products

**File:** `tests/cart/inventory-add-all.spec.ts`

**Steps:**
  1. Hacer clic en el boton Add to cart de cada uno de los 6 productos
    - expect: Badge muestra '6'
    - expect: Los 6 botones muestran 'Remove'
    - expect: Ningun boton 'Add to cart' visible

#### 1.4. Remove product from inventory updates badge and button

**File:** `tests/cart/inventory-remove.spec.ts`

**Steps:**
  1. Agregar Backpack y Bike Light; luego clic en remove-sauce-labs-backpack
    - expect: Badge baja de '2' a '1'
    - expect: El boton del Backpack vuelve a 'Add to cart'
    - expect: Bike Light sigue en 'Remove'

#### 1.5. Badge disappears when cart reaches 0

**File:** `tests/cart/inventory-badge-zero.spec.ts`

**Steps:**
  1. Agregar un producto y quitarlo desde inventario
    - expect: shopping-cart-badge deja de existir en el DOM (count 0), no muestra '0'

#### 1.6. Re-add a product after removing it

**File:** `tests/cart/inventory-readd.spec.ts`

**Steps:**
  1. Agregar, quitar y volver a agregar el mismo producto
    - expect: Badge '1' al final; boton 'Remove'; en el carrito aparece una sola vez con cantidad 1

### 2. 2. Pagina de detalle del producto

**Seed:** `tests/seed.spec.ts`

#### 2.1. Open product detail by name and add to cart

**File:** `tests/cart/detail-add.spec.ts`

**Steps:**
  1. Clic en el nombre (item-4-title-link) o imagen (item-4-img-link) de Sauce Labs Backpack
    - expect: URL: /inventory-item.html?id=4
    - expect: Se muestra nombre, descripcion, precio y boton 'Add to cart' (data-test add-to-cart)
  2. Clic en 'Add to cart'
    - expect: Badge '1'
    - expect: El boton pasa a 'Remove' (data-test remove)

#### 2.2. Remove product from detail page

**File:** `tests/cart/detail-remove.spec.ts`

**Steps:**
  1. Agregar Backpack y Bike Light desde inventario, abrir detalle del Backpack (muestra 'Remove') y pulsar remove
    - expect: Badge baja de '2' a '1' (observado)

#### 2.3. State consistent with inventory after Back to products

**File:** `tests/cart/detail-back-consistency.spec.ts`

**Steps:**
  1. Agregar desde el detalle y pulsar back-to-products; repetir quitando desde el detalle
    - expect: En inventario el boton del producto refleja 'Remove' o 'Add to cart' segun la accion y el badge coincide
    - expect: Tras quitar en detalle, el boton en inventario es 'Add to cart' (observado)

#### 2.4. Detail page of product added in inventory shows Remove

**File:** `tests/cart/detail-state-from-inventory.spec.ts`

**Steps:**
  1. Agregar Backpack en inventario y abrir su detalle
    - expect: El boton muestra 'Remove', no 'Add to cart'

### 3. 3. Pagina del carrito

**Seed:** `tests/seed.spec.ts`

#### 3.1. Cart lists items with matching name, price and quantity

**File:** `tests/cart/cart-contents.spec.ts`

**Steps:**
  1. Agregar Bike Light, Onesie y Bolt T-Shirt; clic en shopping-cart-link
    - expect: URL /cart.html, titulo 'Your Cart'
    - expect: cart-list contiene 3 inventory-item
    - expect: Cada item muestra nombre, descripcion, precio ($9.99, $7.99, $15.99) identicos al inventario
    - expect: item-quantity = '1' en cada fila

#### 3.2. Empty cart shows no items

**File:** `tests/cart/cart-empty.spec.ts`

**Steps:**
  1. Abrir el carrito sin agregar productos
    - expect: cart-list sin inventory-item; sin badge; botones continue-shopping y checkout visibles

#### 3.3. Remove item from cart page

**File:** `tests/cart/cart-remove.spec.ts`

**Steps:**
  1. Agregar 2 productos, abrir carrito, clic en remove-sauce-labs-bike-light
    - expect: La fila desaparece, badge baja a '1' (observado)
    - expect: Al volver a inventario el producto muestra 'Add to cart'

#### 3.4. Continue Shopping keeps cart state

**File:** `tests/cart/cart-continue-shopping.spec.ts`

**Steps:**
  1. Con 1 producto en el carrito, clic en continue-shopping
    - expect: Regresa a /inventory.html, badge sigue en '1' (observado), el producto muestra 'Remove'
  2. Agregar otro producto y abrir carrito de nuevo
    - expect: Aparecen 2 productos

#### 3.5. Open product detail from cart

**File:** `tests/cart/cart-item-link.spec.ts`

**Steps:**
  1. Clic en el nombre del producto en el carrito (p. ej. item-0-title-link)
    - expect: Se abre su pagina de detalle con boton 'Remove'

### 4. 4. Ordenamiento y agregar al carrito

**Seed:** `tests/seed.spec.ts`

#### 4.1. Add product after sorting Name (Z to A)

**File:** `tests/cart/sort-za-add.spec.ts`

**Steps:**
  1. Seleccionar 'za' en product-sort-container; agregar el primer producto mostrado (Test.allTheThings() T-Shirt (Red))
    - expect: Se agrega el producto correcto, badge '1', boton 'Remove' en esa tarjeta

#### 4.2. Add product after sorting Price (low to high) and (high to low)

**File:** `tests/cart/sort-price-add.spec.ts`

**Steps:**
  1. Seleccionar 'lohi' (primero Sauce Labs Onesie $7.99) y agregar el primero; repetir con 'hilo' (primero Sauce Labs Fleece Jacket $49.99)
    - expect: El producto agregado coincide con el mostrado; en el carrito el precio coincide

#### 4.3. Cart state preserved when changing sort order

**File:** `tests/cart/sort-state-preserved.spec.ts`

**Steps:**
  1. Agregar Backpack y Bike Light; cambiar orden entre az, za, lohi, hilo
    - expect: Badge permanece '2' en cada cambio
    - expect: Los botones 'Remove' siguen en las mismas tarjetas (Backpack y Bike Light) tras reordenar
    - expect: Orden esperado A-Z: Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings(); hilo: Fleece Jacket, Backpack, Bolt T-Shirt/Test.allTheThings() (ambos $15.99), Bike Light, Onesie

### 5. 5. Persistencia

**Seed:** `tests/seed.spec.ts`

#### 5.1. Cart persists after page reload

**File:** `tests/cart/persist-reload.spec.ts`

**Steps:**
  1. Agregar un producto y recargar la pagina (page.reload)
    - expect: Badge sigue en '1' y el boton en 'Remove' (observado)
    - expect: El selector de orden vuelve a 'az' (Name A to Z) tras recargar; el orden NO persiste (observado)

#### 5.2. Cart persists after logout and login

**File:** `tests/cart/persist-logout.spec.ts`

**Steps:**
  1. Agregar Sauce Labs Backpack; abrir menu (open-menu), clic en logout-sidebar-link; volver a iniciar sesion como standard_user
    - expect: El badge shopping-cart-badge muestra '1' (verificado: el carrito se guarda en localStorage 'cart-contents' y sobrevive al logout)
    - expect: El boton del Backpack muestra 'Remove'; el carrito contiene 'Sauce Labs Backpack'
    - expect: Esperar a que se renderice el inventario antes de comprobar el badge (comprobarlo inmediatamente tras el login da un falso 'carrito vacio')

#### 5.3. Reset App State clears cart

**File:** `tests/cart/persist-reset-state.spec.ts`

**Steps:**
  1. Agregar productos; abrir menu y clic en reset-sidebar-link ('Reset App State')
    - expect: Badge desaparece inmediatamente
    - expect: RIESGO/BUG observado: sin recargar, algunos botones siguen mostrando 'Remove' (se observo Bike Light en 'Remove' con badge ausente)
    - expect: Tras recargar la pagina todos los botones deben estar en 'Add to cart'

#### 5.4. Cart survives navigation inventory > detail > cart > inventory

**File:** `tests/cart/persist-navigation.spec.ts`

**Steps:**
  1. Agregar 2 productos y navegar entre inventario, detalle, carrito con 'All Items' del menu
    - expect: Badge constante '2' y estados de botones consistentes

### 6. 6. Usuarios especiales (known-buggy-user)

**Seed:** `tests/seed.spec.ts`

#### 6.1. problem_user: add all products (known-buggy-user)

**File:** `tests/cart/problem-user-add.spec.ts`

**Steps:**
  1. Iniciar sesion como problem_user y hacer clic en el boton de cada uno de los 6 productos; luego intentar quitarlos
    - expect: Observado: solo 3 productos quedan en 'Remove' (badge '3') y los demas siguen en 'Add to cart'; los clics en Remove no cambian el estado
    - expect: Marcar como test.fail / known bug; las imagenes tambien son incorrectas en este usuario

#### 6.2. error_user: add and remove products (known-buggy-user)

**File:** `tests/cart/error-user-add.spec.ts`

**Steps:**
  1. Iniciar sesion como error_user, agregar los 6 productos y quitarlos; revisar consola
    - expect: Observado: badge '3' tras intentar agregar 6 y Remove no tiene efecto en algunos productos (errores de consola)
    - expect: Marcar como known bug; la reproduccion debe confirmarse manualmente porque el script de exploracion fue automatico
