import type { components } from "@/schema-from-be";

// InventoryTransaction type from BE schema
export type InventoryTransaction = components["schemas"]["InventoryTransaction"];

// For create/update operations
export type InventoryTransactionCreateRequest = Omit<InventoryTransaction, "id" | "createAt">;
export type InventoryTransactionUpdateRequest = InventoryTransaction;
