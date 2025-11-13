import { ChevronDown, Filter as FilterIcon, X } from "lucide-react-native";

import { useEffect, useMemo, useState } from "react";

import { Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Text } from "@/components/ui/text";

import { cn } from "@/libs/utils";

interface FilterOption {
  value: string;

  label: string;

  type: "select" | "numberRange";

  selectOptions?: { value: string; label: string }[];

  placeholder?: string;

  numberRangeConfig?: {
    fromPlaceholder?: string;

    toPlaceholder?: string;

    min?: number;

    max?: number;

    step?: number;

    suffix?: string; // Unit display like "$", "kg", "pcs"
  };
}

interface FilterCriteria {
  field: string;

  value: string | { from: number | undefined; to: number | undefined };

  label: string;

  type: "select" | "numberRange";
}

// Filter group structure

interface FilterGroup {
  name: string;

  label: string;

  options: FilterOption[];
}

interface FilterProps {
  filterOptions: FilterOption[] | FilterGroup[];

  onFilterChange: (criteria: FilterCriteria[]) => void;

  className?: string;

  showActiveFilters?: boolean;

  groupMode?: boolean; // Flag to check if using groupMode
}

// Type for temp values

type TempFilterValue = string | { from: number | undefined; to: number | undefined } | undefined;

function Filter({
  filterOptions,

  onFilterChange,

  className,

  showActiveFilters = true,

  groupMode = false,
}: FilterProps) {
  const [appliedFilters, setAppliedFilters] = useState<FilterCriteria[]>([]);

  const [tempValues, setTempValues] = useState<Record<string, TempFilterValue>>({});

  const [isOpen, setIsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("");

  const [openSelectField, setOpenSelectField] = useState<string | null>(null);

  // Check if options are grouped

  const isGrouped = groupMode && filterOptions.length > 0 && "name" in filterOptions[0];

  const filterGroups = useMemo(() => {
    return isGrouped ? (filterOptions as FilterGroup[]) : [];
  }, [isGrouped, filterOptions]);

  const flatOptions = isGrouped
    ? filterGroups.flatMap((group) => group.options)
    : (filterOptions as FilterOption[]);

  // Create defaultTab if using groupMode

  useEffect(() => {
    if (isGrouped && filterGroups.length > 0) {
      setActiveTab(filterGroups[0].name);
    }
  }, [isGrouped, filterGroups]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // When opening modal, load current values into temp

      const currentValues: Record<string, TempFilterValue> = {};

      appliedFilters.forEach((filter) => {
        currentValues[filter.field] = filter.value;
      });

      setTempValues(currentValues);
    }

    setIsOpen(open);
  };

  const handleTempValueChange = (field: string, value: TempFilterValue) => {
    setTempValues((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  const isValidFilter = (option: FilterOption, value: TempFilterValue): boolean => {
    if (option.type === "numberRange") {
      const range = value as { from: number | undefined; to: number | undefined };

      return Boolean(range && (range.from !== undefined || range.to !== undefined));
    }

    return Boolean(value && value !== "");
  };

  const handleApplyFilters = () => {
    // Create list of filters from entered values

    const validFilters: FilterCriteria[] = [];

    flatOptions.forEach((option) => {
      const value = tempValues[option.value];

      if (isValidFilter(option, value)) {
        validFilters.push({
          field: option.value,

          value: value as string | { from: number | undefined; to: number | undefined },

          label: option.label,

          type: option.type,
        });
      }
    });

    setAppliedFilters(validFilters);

    onFilterChange(validFilters);

    setIsOpen(false);
  };

  const handleCancel = () => {
    // Reset temp values to applied values

    const currentValues: Record<string, TempFilterValue> = {};

    appliedFilters.forEach((filter) => {
      currentValues[filter.field] = filter.value;
    });

    setTempValues(currentValues);

    setIsOpen(false);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters([]);

    setTempValues({});

    onFilterChange([]);
  };

  const handleRemoveAppliedFilter = (index: number) => {
    const newFilters = appliedFilters.filter((_, i) => i !== index);

    setAppliedFilters(newFilters);

    onFilterChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return appliedFilters.length;
  };

  const renderNumberRangeFilter = (option: FilterOption) => {
    const value = (tempValues[option.value] as {
      from: number | undefined;

      to: number | undefined;
    }) || { from: undefined, to: undefined };

    const config = option.numberRangeConfig || {};

    const {
      fromPlaceholder = "From value",

      toPlaceholder = "To value",

      min = 0,

      max,

      step = 1,
    } = config;

    return (
      <View className="gap-2">
        <Text className="text-sm font-medium">{option.label}</Text>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Input
              keyboardType="numeric"
              placeholder={fromPlaceholder}
              value={value.from?.toString() ?? ""}
              onChangeText={(text) => {
                const num = text ? Number(text) : undefined;

                handleTempValueChange(option.value, { ...value, from: num });
              }}
            />
          </View>

          <View className="flex-1">
            <Input
              keyboardType="numeric"
              placeholder={toPlaceholder}
              value={value.to?.toString() ?? ""}
              onChangeText={(text) => {
                const num = text ? Number(text) : undefined;

                handleTempValueChange(option.value, { ...value, to: num });
              }}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderSelectFilter = (option: FilterOption) => {
    const stringValue = (tempValues[option.value] as string) || "";

    const selectedOption = option.selectOptions?.find((opt) => opt.value === stringValue);

    const isSelectOpen = openSelectField === option.value;

    return (
      <View className="gap-2">
        <Text className="text-sm font-medium">{option.label}</Text>

        <View>
          <TouchableOpacity
            onPress={() => setOpenSelectField(isSelectOpen ? null : option.value)}
            className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2">
            <Text className={cn("text-sm", !selectedOption && "text-muted-foreground")}>
              {selectedOption?.label ||
                option.placeholder ||
                `Select ${option.label.toLowerCase()}`}
            </Text>

            <ChevronDown className="text-muted-foreground" size={16} />
          </TouchableOpacity>

          {/* Dropdown Menu */}

          {isSelectOpen && (
            <View className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-popover shadow-lg">
              <ScrollView className="max-h-60">
                {option.selectOptions?.map((selectOption) => (
                  <TouchableOpacity
                    key={selectOption.value}
                    onPress={() => {
                      handleTempValueChange(option.value, selectOption.value);

                      setOpenSelectField(null);
                    }}
                    className={cn(
                      "border-b border-border/50 px-3 py-2",

                      selectedOption?.value === selectOption.value && "bg-accent"
                    )}>
                    <Text
                      className={cn(
                        "text-sm",

                        selectedOption?.value === selectOption.value && "font-semibold"
                      )}>
                      {selectOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  const hasAnyValues = () => {
    return Object.values(tempValues).some((value) => {
      if (typeof value === "object" && value !== null && value !== undefined) {
        if ("from" in value && "to" in value) {
          return value.from !== undefined || value.to !== undefined;
        }
      }

      return value && value !== "";
    });
  };

  const formatNumberRange = (
    range: { from: number | undefined; to: number | undefined },

    suffix: string
  ): string => {
    const fromStr = range.from !== undefined ? range.from.toLocaleString() + suffix : "";

    const toStr = range.to !== undefined ? range.to.toLocaleString() + suffix : "";

    if (fromStr && toStr) return `: ${fromStr} - ${toStr}`;

    if (fromStr) return `: from ${fromStr}`;

    if (toStr) return `: to ${toStr}`;

    return "";
  };

  const formatFilterValue = (filter: FilterCriteria): string => {
    switch (filter.type) {
      case "numberRange": {
        const range = filter.value as { from: number | undefined; to: number | undefined };

        const option = flatOptions.find((opt) => opt.value === filter.field);

        const suffix = option?.numberRangeConfig?.suffix || "";

        return formatNumberRange(range, suffix);
      }

      default:
        return `: ${filter.value}`;
    }
  };

  return (
    <View className={cn("gap-3", className)}>
      {/* Filter trigger button and clear button */}

      <View className="flex-row justify-end gap-2">
        {/* Clear all filters button - only show when there are applied filters */}

        {appliedFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onPress={handleClearAllFilters}
            className="flex-row gap-1">
            <X className="text-foreground" size={12} />

            <Text>Clear filters</Text>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onPress={() => handleOpenChange(true)}
          className="flex-row gap-1">
          <FilterIcon className="text-foreground" size={16} />

          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1">
              <Text className="text-xs">{getActiveFiltersCount()}</Text>
            </Badge>
          )}

          <ChevronDown className="text-foreground" size={12} />
        </Button>
      </View>

      {/* Filter Modal */}

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setOpenSelectField(null); // Close any open dropdown

          handleOpenChange(false);
        }}>
        <View className="flex-1 bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => {
              setOpenSelectField(null); // Close dropdown when tapping outside

              handleOpenChange(false);
            }}
          />

          <View className="max-h-[80%] rounded-t-3xl bg-background">
            <View className="p-4">
              {/* Header */}

              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-sm font-medium">Filters</Text>

                {hasAnyValues() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setTempValues({})}
                    className="h-auto p-1">
                    <Text className="text-xs text-muted-foreground">Clear all</Text>
                  </Button>
                )}
              </View>

              {/* Filter inputs */}

              <ScrollView className="max-h-96">
                <Pressable onPress={() => setOpenSelectField(null)}>
                  <View className="gap-4">
                    {flatOptions.map((option) => (
                      <View key={option.value}>
                        {option.type === "numberRange" && renderNumberRangeFilter(option)}

                        {option.type === "select" && renderSelectFilter(option)}
                      </View>
                    ))}
                  </View>
                </Pressable>
              </ScrollView>

              {/* Action buttons */}

              <View className="mt-4 flex-row items-center justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onPress={handleCancel}>
                  <Text>Cancel</Text>
                </Button>

                <Button size="sm" onPress={handleApplyFilters}>
                  <Text>Apply</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Applied filters display */}

      {showActiveFilters && appliedFilters.length > 0 && (
        <View className="flex-row justify-end">
          <View className="max-w-3xl flex-row flex-wrap justify-end gap-2">
            {appliedFilters.map((filter, index) => (
              <Badge
                key={`applied-${filter.field}-${index}`}
                variant="secondary"
                className="flex-row items-center gap-1">
                <Text className="text-xs">
                  {filter.label}

                  {formatFilterValue(filter)}
                </Text>

                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => handleRemoveAppliedFilter(index)}
                  className="h-3 w-3 p-0">
                  <X className="text-foreground" size={8} />
                </Button>
              </Badge>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export { Filter, type FilterCriteria, type FilterGroup, type FilterOption, type FilterProps };

