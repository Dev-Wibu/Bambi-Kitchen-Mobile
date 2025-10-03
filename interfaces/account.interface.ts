import type { components } from "@/schema-from-be";
import type { ROLE_TYPE } from "./role.interface";

// Account type from BE schema
export type Account = components["schemas"]["Account"];

// Account create request from BE schema
export type AccountCreateRequest = components["schemas"]["AccountCreateRequest"];

// Custom account interface with additional fields
export interface AccountData {
  id: number;
  name: string;
  mail: string;
  phone?: string;
  role: ROLE_TYPE;
  createAt?: string;
  updateAt?: string;
  active?: boolean;
}
