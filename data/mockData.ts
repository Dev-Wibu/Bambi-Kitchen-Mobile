/**

 * MOCK DATA FILE

 *

 * This file contains all mock data for the application.

 * It is used when the backend has no data available.

 *

 * TO REMOVE MOCK DATA:

 * Simply delete this file and remove all imports of mockData from the app files.

 * All mock data is centralized here for easy removal.

 */

import type { components } from "@/schema-from-be";

// Type definitions from backend schema

export type Dish = components["schemas"]["Dish"];

export type DishCategory = components["schemas"]["DishCategory"];

export type DishTemplate = components["schemas"]["DishTemplate"];

export type Ingredient = components["schemas"]["Ingredient"];

export type IngredientCategory = components["schemas"]["IngredientCategory"];

export type Account = components["schemas"]["Account"];

export type Notification = components["schemas"]["Notification"];

export type Orders = components["schemas"]["Orders"];

// Mock Dish Categories

export const mockDishCategories: DishCategory[] = [
  {
    id: 1,

    name: "Poké Bowls",

    description: "Fresh and healthy bowls",
  },

  {
    id: 2,

    name: "Salads",

    description: "Green and nutritious salads",
  },

  {
    id: 3,

    name: "Noodles",

    description: "Asian-style noodle dishes",
  },

  {
    id: 4,

    name: "Drinks",

    description: "Refreshing beverages",
  },

  {
    id: 5,

    name: "Desserts",

    description: "Sweet treats",
  },
];

// Mock Dish Templates

export const mockDishTemplates: DishTemplate[] = [
  {
    size: "S",

    name: "Small Bowl",

    priceRatio: 1.0,

    quantityRatio: 1.0,

    max_Carb: 150,

    max_Protein: 100,

    max_Vegetable: 80,
  },

  {
    size: "M",

    name: "Medium Bowl",

    priceRatio: 1.5,

    quantityRatio: 1.5,

    max_Carb: 225,

    max_Protein: 150,

    max_Vegetable: 120,
  },

  {
    size: "L",

    name: "Large Bowl",

    priceRatio: 2.0,

    quantityRatio: 2.0,

    max_Carb: 300,

    max_Protein: 200,

    max_Vegetable: 160,
  },
];

// Mock Ingredient Categories

export const mockIngredientCategories: IngredientCategory[] = [
  {
    id: 1,

    name: "Proteins",

    description: "Meat and protein sources",
  },

  {
    id: 2,

    name: "Carbohydrates",

    description: "Rice, noodles, and grains",
  },

  {
    id: 3,

    name: "Vegetables",

    description: "Fresh vegetables",
  },

  {
    id: 4,

    name: "Sauces",

    description: "Dressings and sauces",
  },

  {
    id: 5,

    name: "Toppings",

    description: "Additional toppings",
  },
];

// Mock Ingredients

export const mockIngredients: Ingredient[] = [
  {
    id: 1,

    name: "Grilled Chicken",

    category: mockIngredientCategories[0],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Chicken",
  },

  {
    id: 2,

    name: "Teriyaki Beef",

    category: mockIngredientCategories[0],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Beef",
  },

  {
    id: 3,

    name: "Salmon",

    category: mockIngredientCategories[0],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Salmon",
  },

  {
    id: 4,

    name: "Tofu",

    category: mockIngredientCategories[0],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Tofu",
  },

  {
    id: 5,

    name: "White Rice",

    category: mockIngredientCategories[1],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Rice",
  },

  {
    id: 6,

    name: "Brown Rice",

    category: mockIngredientCategories[1],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Brown+Rice",
  },

  {
    id: 7,

    name: "Noodles",

    category: mockIngredientCategories[1],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Noodles",
  },

  {
    id: 8,

    name: "Mixed Greens",

    category: mockIngredientCategories[2],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Greens",
  },

  {
    id: 9,

    name: "Cucumber",

    category: mockIngredientCategories[2],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Cucumber",
  },

  {
    id: 10,

    name: "Avocado",

    category: mockIngredientCategories[2],

    unit: "GRAM",

    active: true,

    imgUrl: "https://placehold.co/400x400/FF6D00/FFFFFF?text=Avocado",
  },
];

// Mock Dishes

export const mockDishes: Dish[] = [
  {
    id: 1,

    name: "Teriyaki Beef Bowl",

    description: "Grilled teriyaki beef with steamed rice and fresh vegetables",

    price: 16500,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Teriyaki+Beef",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 2,

    name: "Waikiki Poké Bowl",

    description: "Fresh salmon with rice, avocado, and signature sauce",

    price: 18000,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Poke+Bowl",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 3,

    name: "Honolulu Poké Bowl",

    description: "Mixed seafood with fresh greens and tropical fruits",

    price: 19500,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Honolulu",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 4,

    name: "Chicken Power Bowl",

    description: "Grilled chicken with quinoa and mixed vegetables",

    price: 15000,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Chicken+Bowl",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 5,

    name: "Vegan Buddha Bowl",

    description: "Tofu, brown rice, and fresh seasonal vegetables",

    price: 14000,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Buddha+Bowl",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 6,

    name: "Ramen Noodles",

    description: "Traditional Japanese ramen with pork and egg",

    price: 17000,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Ramen",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 7,

    name: "Pho Noodles",

    description: "Vietnamese beef noodle soup with herbs",

    price: 16000,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Pho",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },

  {
    id: 8,

    name: "Greek Salad",

    description: "Fresh Mediterranean salad with feta cheese",

    price: 12000,

    imageUrl: "https://placehold.co/600x400/FF6D00/FFFFFF?text=Greek+Salad",

    dishType: "PRESET",

    usedQuantity: 0,

    public: true,

    active: true,
  },
];

// Mock Notifications

export const mockNotifications: Notification[] = [
  {
    id: 1,

    title: "Welcome!",

    message: "Thank you for joining us. Enjoy your first order!",

    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),

    read: false,
  },

  {
    id: 2,

    title: "Order Confirmed",

    message: "Your order #1234 has been confirmed and is being prepared.",

    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),

    read: false,
  },

  {
    id: 3,

    title: "New Promotion Available",

    message: "Weekend special: Special offers available this weekend!",

    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),

    read: true,
  },
];

// Mock Orders

export const mockOrders: Orders[] = [
  {
    id: 1,

    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),

    totalPrice: 48500,

    status: "COMPLETED",

    userId: 1,

    note: "Please make it spicy",

    ranking: 5,
  },

  {
    id: 2,

    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),

    totalPrice: 33000,

    status: "COMPLETED",

    userId: 1,

    note: "",

    ranking: 4,
  },

  {
    id: 3,

    createAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),

    totalPrice: 16500,

    status: "PENDING",

    userId: 1,

    note: "Extra vegetables please",
  },
];

// Mock Accounts

export const mockAccounts: Account[] = [
  {
    id: 1,

    name: "John Doe",

    role: "USER",

    mail: "john@example.com",

    phone: "+84901234567",

    active: true,

    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),

    updateAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },

  {
    id: 2,

    name: "Jane Smith",

    role: "USER",

    mail: "jane@example.com",

    phone: "+84909876543",

    active: true,

    createAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),

    updateAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

// Export flag to easily enable/disable mock data

export const USE_MOCK_DATA = true;

// Helper function to wrap data in the expected API response format

export function mockApiResponse<T>(data: T) {
  return {
    data,

    statusCode: 200,

    message: "Success (Mock Data)",
  };
}
