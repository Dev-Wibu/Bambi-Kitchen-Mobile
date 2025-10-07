import type {
  InventoryTransactionCreateRequest,
  InventoryTransactionUpdateRequest,
} from "@/interfaces/inventoryTransaction.interface";
import { $api } from "@/libs/api";

// ==================== INVENTORY TRANSACTION API HOOKS ====================

/**
 * Hook for getting all inventory transactions
 * Uses GET /api/inventory-transactions endpoint
 */
export const useInventoryTransactions = () => {
  return $api.useQuery("get", "/api/inventory-transactions", {});
};

/**
 * Hook for getting inventory transaction by ID
 * Uses GET /api/inventory-transactions/{id} endpoint
 */
export const useGetInventoryTransactionById = (id: number) => {
  return $api.useQuery("get", "/api/inventory-transactions/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new inventory transaction
 * Uses POST /api/inventory-transactions endpoint
 */
export const useCreateInventoryTransaction = () => {
  return $api.useMutation("post", "/api/inventory-transactions");
};

/**
 * Hook for updating an existing inventory transaction
 * Uses PUT /api/inventory-transactions/{id} endpoint
 */
export const useUpdateInventoryTransaction = () => {
  return $api.useMutation("put", "/api/inventory-transactions/{id}");
};

/**
 * Hook for deleting an inventory transaction
 * Uses DELETE /api/inventory-transactions/{id} endpoint
 */
export const useDeleteInventoryTransaction = () => {
  return $api.useMutation("delete", "/api/inventory-transactions/{id}");
};

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
