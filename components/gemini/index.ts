// Export components
export { AIReviewButton } from "./AIReviewButton";
export { AIReviewCard } from "./AIReviewCard";
export { AIReviewModal } from "./AIReviewModal";

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
