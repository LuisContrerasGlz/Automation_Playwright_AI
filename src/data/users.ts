export interface User {
  username: string;
  password: string;
}

const defaultPassword = process.env.STANDARD_PASSWORD ?? 'secret_sauce';
const standardUsername = process.env.STANDARD_USER ?? 'standard_user';

export const users = {
  standard: {
    username: standardUsername,
    password: defaultPassword,
  },
  lockedOut: {
    username: 'locked_out_user',
    password: defaultPassword,
  },
  problem: {
    username: 'problem_user',
    password: defaultPassword,
  },
  error: {
    username: 'error_user',
    password: defaultPassword,
  },
  invalidPassword: {
    username: standardUsername,
    password: 'wrong_password',
  },
  unknown: {
    username: 'unknown_user',
    password: 'any_password',
  },
  /** Usernames are case-sensitive, so this one is rejected. */
  wrongCase: {
    username: standardUsername.toUpperCase(),
    password: defaultPassword,
  },
  emptyUsername: {
    username: '',
    password: defaultPassword,
  },
  emptyPassword: {
    username: standardUsername,
    password: '',
  },
  empty: {
    username: '',
    password: '',
  },
} satisfies Record<string, User>;
