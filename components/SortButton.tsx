import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/libs/utils";
import * as React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

type SortDirection = "asc" | "desc" | "none";

interface SortButtonProps extends Omit<React.ComponentProps<typeof Button>, "onChange"> {
  onChange?: (direction: SortDirection) => void;
  direction?: SortDirection;
  label?: string;
  field?: string; // Added field prop for identifying which column to sort
  children?: React.ReactNode;
}

// Custom Sort Icon with larger size
const CustomSortIcon = ({ direction }: { direction?: SortDirection }) => {
  const baseSize = 24; // Increased size for better visibility on mobile
  const opacityUp = direction === "desc" ? 0.3 : 1;
  const opacityDown = direction === "asc" ? 0.3 : 1;

  return (
    <Svg viewBox="0 0 16 16" width={baseSize} height={baseSize} fill="currentColor">
      <Path d="M5 6 L8 2 L11 6 Z" opacity={opacityUp} />
      <Path d="M5 10 L8 14 L11 10 Z" opacity={opacityDown} />
    </Svg>
  );
};

// Function to render icon
const renderSortIcon = (direction: SortDirection) => {
  return <CustomSortIcon direction={direction} />;
};

// Function to get aria label
const getSortAriaLabel = (direction: SortDirection) => {
  if (direction === "none") return "Sort";
  if (direction === "asc") return "Sort ascending";
  return "Sort descending";
};

// Function to calculate next direction
const getNextDirection = (currentDirection: SortDirection): SortDirection => {
  if (currentDirection === "none") return "asc";
  if (currentDirection === "asc") return "desc";
  return "none";
};

export function SortButton({
  onChange,
  direction: externalDirection,
  label,
  className,
  children,
  ...props
}: Readonly<SortButtonProps>) {
  const [internalDirection, setInternalDirection] = React.useState<SortDirection>("none");

  // Use external direction if provided, otherwise use internal state
  const direction = externalDirection ?? internalDirection;

  const handlePress = () => {
    const newDirection = getNextDirection(direction);
    setInternalDirection(newDirection);
    onChange?.(newDirection);
  };

  // Use children or label if available
  const displayLabel = children || label;

  return (
    <View className="flex-row items-center gap-2">
      {displayLabel && <Text className="whitespace-nowrap">{displayLabel}</Text>}
      <Button
        variant="ghost"
        size="icon"
        className={cn("ml-1 h-6 w-6 p-0", className)}
        onPress={handlePress}
        accessibilityLabel={getSortAriaLabel(direction)}
        {...props}>
        {renderSortIcon(direction)}
      </Button>
    </View>
  );
}
