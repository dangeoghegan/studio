/**
 * Represents a bank account.
 */
export interface BankAccount {
  /**
   * The name of the bank account.
   */
  name: string;
  /**
   * The current balance of the bank account.
   */
  balance: number;
  /**
   * The type of the bank account (e.g., Checking, Savings).
   */
  type: string;
}

/**
 * Asynchronously retrieves a list of bank accounts.
 *
 * @returns A promise that resolves to an array of BankAccount objects.
 */
export async function getBankAccounts(): Promise<BankAccount[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      name: 'Checking Account',
      balance: 1000,
      type: 'Checking',
    },
    {
      name: 'Savings Account',
      balance: 5000,
      type: 'Savings',
    },
  ];
}
