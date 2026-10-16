export const loginErrors = {
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  /** Shown on the login page when a protected page is opened without a session. */
  accessDenied: (path: string) => `Epic sadface: You can only access '${path}' when you are logged in.`,
} as const;

export const checkoutErrors = {
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
} as const;
