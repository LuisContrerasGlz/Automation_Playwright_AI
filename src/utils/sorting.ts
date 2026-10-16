import { type Product } from '@data/products';
import { sortOptions, type SortOption } from '@data/sort-options';
import { parsePrice } from './pricing';

/** Returns the product names in the order the store should display them for a given sort option. */
export function expectedOrder(items: Product[], option: SortOption): string[] {
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  const byPrice = (a: Product, b: Product) => parsePrice(a.price) - parsePrice(b.price);

  const comparators: Record<SortOption, (a: Product, b: Product) => number> = {
    [sortOptions.nameAsc]: byName,
    [sortOptions.nameDesc]: (a, b) => byName(b, a),
    [sortOptions.priceAsc]: byPrice,
    [sortOptions.priceDesc]: (a, b) => byPrice(b, a),
  };

  return [...items].sort(comparators[option]).map((item) => item.name);
}
