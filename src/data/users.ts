export interface User {
  username: string;
  password: string;
}

const defaultPassword = process.env.STANDARD_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: defaultPassword,
  },
  lockedOut: {
    username: 'locked_out_user',
    password: defaultPassword,
  },
  invalidPassword: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: 'wrong_password',
  },
} satisfies Record<string, User>;
