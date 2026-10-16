import { type Product } from '@data/products';
import { TAX_RATE } from '@data/checkout';

export const parsePrice = (price: string): number => Number(price.replace('$', ''));

export const formatPrice = (amount: number): string => `$${amount.toFixed(2)}`;

export interface OrderSummary {
  itemTotal: string;
  tax: string;
  total: string;
}

/**
 * Expected checkout overview labels for a set of products, formatted exactly as the site shows them.
 * Works in cents to avoid floating-point errors.
 */
export function expectedSummary(items: Product[]): OrderSummary {
  const itemTotalCents = items.reduce((sum, item) => sum + Math.round(parsePrice(item.price) * 100), 0);
  const taxCents = Math.round(itemTotalCents * TAX_RATE);
  return {
    itemTotal: `Item total: ${formatPrice(itemTotalCents / 100)}`,
    tax: `Tax: ${formatPrice(taxCents / 100)}`,
    total: `Total: ${formatPrice((itemTotalCents + taxCents) / 100)}`,
  };
}
