export interface User {
  username: string;
  password: string;
}

export const users = {
  standard: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: process.env.STANDARD_PASSWORD ?? 'secret_sauce',
  },
} satisfies Record<string, User>;
