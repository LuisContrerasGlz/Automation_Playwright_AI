export interface Product {
  name: string;
  price: string;
}

export const products = {
  backpack: { name: 'Sauce Labs Backpack', price: '$29.99' },
  bikeLight: { name: 'Sauce Labs Bike Light', price: '$9.99' },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  onesie: { name: 'Sauce Labs Onesie', price: '$7.99' },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
} satisfies Record<string, Product>;

export const allProducts: Product[] = Object.values(products);
