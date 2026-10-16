export const TAX_RATE = 0.08;

export const checkoutTitles = {
  information: 'Checkout: Your Information',
  overview: 'Checkout: Overview',
  complete: 'Checkout: Complete!',
} as const;

export const checkoutInfo = {
  payment: 'SauceCard #31337',
  shipping: 'Free Pony Express Delivery!',
} as const;

export const orderConfirmation = {
  header: 'Thank you for your order!',
  text: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
} as const;
