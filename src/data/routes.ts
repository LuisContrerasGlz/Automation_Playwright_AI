export const routes = {
  login: '/',
  inventory: '/inventory.html',
  productDetail: (id: number) => `/inventory-item.html?id=${id}`,
  cart: '/cart.html',
  checkoutInformation: '/checkout-step-one.html',
  checkoutOverview: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;

/** Pages that require a session. `path` is what the site echoes in its error (no query string). */
export const protectedPages = [
  { url: routes.inventory, path: '/inventory.html' },
  { url: routes.productDetail(4), path: '/inventory-item.html' },
  { url: routes.cart, path: '/cart.html' },
  { url: routes.checkoutInformation, path: '/checkout-step-one.html' },
  { url: routes.checkoutOverview, path: '/checkout-step-two.html' },
  { url: routes.checkoutComplete, path: '/checkout-complete.html' },
];
