import type { DiscountCreateRequest, DiscountUpdateRequest } from "@/interfaces/discount.interface";
import { $api } from "@/libs/api";

// ==================== DISCOUNT API HOOKS ====================

/**
 * Hook for getting all discounts
 * Uses GET /api/discount endpoint
 */
export const useDiscounts = () => {
  return $api.useQuery("get", "/api/discount", {});
};

/**
 * Hook for getting discount by ID
 * Uses GET /api/discount/{id} endpoint
 */
export const useGetDiscountById = (id: number) => {
  return $api.useQuery("get", "/api/discount/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });
};

/**
 * Hook for creating a new discount
 * Uses POST /api/discount endpoint
 */
export const useCreateDiscount = () => {
  return $api.useMutation("post", "/api/discount");
};

/**
 * Hook for updating an existing discount
 * Uses PUT /api/discount endpoint
 */
export const useUpdateDiscount = () => {
  return $api.useMutation("put", "/api/discount");
};

/**
 * Hook for deleting a discount
 * Uses DELETE /api/discount/{id} endpoint
 */
export const useDeleteDiscount = () => {
  return $api.useMutation("delete", "/api/discount/{id}");
};

// ==================== TRANSFORM FUNCTIONS ====================

/**
 * Transform discount form data to create request format
 */
export const transformDiscountCreateRequest = (data: {
  name: string;
  discountPercent?: number;
  quantity?: number;
  startTime?: string;
  endTime?: string;
  code?: string;
  description?: string;
}): DiscountCreateRequest => {
  return {
    name: data.name,
    discountPercent: data.discountPercent,
    quantity: data.quantity,
    startTime: data.startTime,
    endTime: data.endTime,
    code: data.code,
    description: data.description,
  };
};

/**
 * Transform discount form data to update request format
 */
export const transformDiscountUpdateRequest = (data: {
  id: number;
  name?: string;
  discountPercent?: number;
  quantity?: number;
  startTime?: string;
  endTime?: string;
  description?: string;
}): DiscountUpdateRequest => {
  return {
    id: data.id,
    name: data.name,
    discountPercent: data.discountPercent,
    quantity: data.quantity,
    startTime: data.startTime,
    endTime: data.endTime,
    description: data.description,
  };
};
