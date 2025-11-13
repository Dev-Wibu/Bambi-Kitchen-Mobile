// Export components
export { AIReviewButton } from "./AIReviewButton";
export { AIReviewModal } from "./AIReviewModal";
export { AIReviewCard } from "./AIReviewCard";

// Export shared types
export interface GeminiResponseDto {
  score?: number;
  title?: string;
  roast?: string;
  totals?: {
    calories?: number;
    protein?: number;
    carb?: number;
    fat?: number;
    fiber?: number;
  };
  suggest?: string;
}
