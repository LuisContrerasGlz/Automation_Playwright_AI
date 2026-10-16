export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const customers = {
  valid: { firstName: 'John', lastName: 'Doe', postalCode: '12345' },
  /** Not a valid customer: the site accepts it (known bug). */
  whitespaceOnly: { firstName: ' ', lastName: ' ', postalCode: 'abc!@#' },
} satisfies Record<string, Customer>;
