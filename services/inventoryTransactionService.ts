import type {
  InventoryTransactionCreateRequest,
  InventoryTransactionUpdateRequest,
} from "@/interfaces/inventoryTransaction.interface";
import { $api } from "@/libs/api";
import { useMutationHandler } from "@/hooks/useMutationHandler";

// ==================== INVENTORY TRANSACTION API HOOKS ====================

/**
 * Hook for getting all inventory transactions
 * Uses GET /api/inventory-transaction endpoint (fixed from /api/inventory-transactions)
 */
export const useInventoryTransactions = () => {
  return $api.useQuery("get", "/api/inventory-transaction" as any, {});
};

/**
 * Hook for getting inventory transaction by ID
 * Uses GET /api/inventory-transaction/{id} endpoint (fixed from /api/inventory-transactions/{id})
 */
export const useGetInventoryTransactionById = (id: number) => {
  return $api.useQuery("get", "/api/inventory-transaction/{id}" as any, {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new inventory transaction
 * Uses POST /api/inventory-transaction endpoint (fixed from /api/inventory-transactions)
 */
export const useCreateInventoryTransaction = () => {
  return $api.useMutation("post", "/api/inventory-transaction" as any);
};

/**
 * Hook for updating an existing inventory transaction
 * Uses PUT /api/inventory-transaction/{id} endpoint (fixed from /api/inventory-transactions/{id})
 */
export const useUpdateInventoryTransaction = () => {
  return $api.useMutation("put", "/api/inventory-transaction/{id}" as any);
};

// DELETE operation removed - inventory transactions should not be deleted for audit trail purposes

// ==================== ENHANCED MUTATIONS WITH AUTO TOAST ====================

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform inventory transaction form data to create request format
 */
export const transformInventoryTransactionCreateRequest = (data: {
  ingredientId: number;
  orderId?: number;
  quantity: number;
  transactionType: boolean;
}): InventoryTransactionCreateRequest => {
  return {
    ingredient: {
      id: data.ingredientId,
      name: "", // Will be filled by backend
    },
    orders: data.orderId
      ? {
          id: data.orderId,
        }
      : undefined,
    quantity: data.quantity,
    transactionType: data.transactionType,
  };
};

/**
 * Transform inventory transaction form data to update request format
 */
export const transformInventoryTransactionUpdateRequest = (data: {
  id: number;
  ingredientId: number;
  orderId?: number;
  quantity: number;
  transactionType: boolean;
}): InventoryTransactionUpdateRequest => {
  return {
    id: data.id,
    ingredient: {
      id: data.ingredientId,
      name: "", // Will be filled by backend
    },
    orders: data.orderId
      ? {
          id: data.orderId,
        }
      : undefined,
    quantity: data.quantity,
    transactionType: data.transactionType,
  };
};
