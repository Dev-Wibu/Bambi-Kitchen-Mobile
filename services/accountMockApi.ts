/**
 * MOCKAPI FILE - TO BE REMOVED WHEN BACKEND IS READY
 *
 * This file provides mock authentication functionality while the backend
 * CORS and session cookie issues are being resolved.
 *
 * REMOVAL INSTRUCTIONS:
 * 1. Delete this file (accountMockApi.ts)
 * 2. Search for "MOCKAPI:" comments in the codebase and remove those sections
 * 3. Uncomment the original backend API calls in AuthContext.tsx
 */

import type { Account, AccountCreateRequest } from "@/interfaces/account.interface";

// Mock account storage - simulates database
let mockAccounts: Account[] = [
  {
    id: 1,
    name: "Test User",
    mail: "test@email.com",
    phone: "0912345678",
    password: "123456", // Plain text for testing (matches BE's NoOpPasswordEncoder)
    role: "USER",
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 2,
    name: "Admin User",
    mail: "admin@email.com",
    phone: "0987654321",
    password: "admin123",
    role: "ADMIN",
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 3,
    name: "Staff User",
    mail: "staff@email.com",
    phone: "0909090909",
    password: "staff123",
    role: "STAFF",
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString(),
    active: true,
  },
];

let nextId = 4;

/**
 * Mock login function
 * Validates credentials against mock accounts
 * Backend expects phone as username
 */
export const mockLogin = async (
  username: string,
  password: string
): Promise<{ success: boolean; account?: Account; error?: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find account by phone (username) or email
  const account = mockAccounts.find(
    (acc) => (acc.phone === username || acc.mail === username) && acc.active
  );

  if (!account) {
    return {
      success: false,
      error: "Account not found or inactive",
    };
  }

  // Validate password (plain text comparison since BE uses NoOpPasswordEncoder)
  if (account.password !== password) {
    return {
      success: false,
      error: "Invalid password",
    };
  }

  // Return account without password
  const { password: _, ...accountWithoutPassword } = account;
  return {
    success: true,
    account: accountWithoutPassword as Account,
  };
};

/**
 * Mock register function
 * Creates new account and stores in mock database
 */
export const mockRegister = async (
  data: AccountCreateRequest & { phone: string }
): Promise<{ success: boolean; account?: Account; error?: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if account with same email or phone already exists
  const existingAccount = mockAccounts.find(
    (acc) => acc.mail === data.mail || acc.phone === data.phone
  );

  if (existingAccount) {
    return {
      success: false,
      error: "Account with this email or phone already exists",
    };
  }

  // Create new account
  const newAccount: Account = {
    id: nextId++,
    name: data.name,
    mail: data.mail,
    phone: data.phone,
    password: data.password, // Store plain text (matches BE behavior)
    role: data.role || "USER", // Default to USER if not specified
    createAt: new Date().toISOString(),
    updateAt: new Date().toISOString(),
    active: true,
  };

  // Add to mock database
  mockAccounts.push(newAccount);

  // Return account without password
  const { password: _, ...accountWithoutPassword } = newAccount;
  return {
    success: true,
    account: accountWithoutPassword as Account,
  };
};

/**
 * Mock get user info function
 * Returns user info based on account ID
 */
export const mockGetUserInfo = async (
  accountId: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const account = mockAccounts.find((acc) => acc.id === accountId && acc.active);

  if (!account) {
    return {
      success: false,
      error: "Account not found",
    };
  }

  // Return data in format expected by /api/user/me endpoint
  return {
    success: true,
    data: {
      userId: account.id,
      name: account.name,
      role: [account.role], // BE returns role as array
    },
  };
};

/**
 * Get all mock accounts (for debugging)
 */
export const getAllMockAccounts = () => {
  return mockAccounts.map(({ password: _, ...account }) => account);
};

/**
 * Reset mock accounts to initial state (for testing)
 */
export const resetMockAccounts = () => {
  mockAccounts = [
    {
      id: 1,
      name: "Test User",
      mail: "test@email.com",
      phone: "0912345678",
      password: "123456",
      role: "USER",
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      active: true,
    },
    {
      id: 2,
      name: "Admin User",
      mail: "admin@email.com",
      phone: "0987654321",
      password: "admin123",
      role: "ADMIN",
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      active: true,
    },
    {
      id: 3,
      name: "Staff User",
      mail: "staff@email.com",
      phone: "0909090909",
      password: "staff123",
      role: "STAFF",
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString(),
      active: true,
    },
  ];
  nextId = 4;
};
