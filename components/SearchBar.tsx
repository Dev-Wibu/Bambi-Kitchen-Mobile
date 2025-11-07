import { Search, X } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/libs/utils";

interface SearchOption {
  value: string;
  label: string;
}

interface SearchBarProps {
  searchOptions: SearchOption[]; // Fields that can be searched
  onSearchChange: (searchValue: string) => void; // Returns search value only
  className?: string;
  placeholder?: string;
  limitedFields?: boolean; // Display information about searchable fields
  resetPagination?: () => void; // Reset pagination when searching
}

function SearchBar({
  searchOptions,
  onSearchChange,
  className,
  placeholder = "Search...",
  limitedFields = true,
  resetPagination,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange(value);
    // Reset to page 1 when searching
    if (resetPagination) {
      resetPagination();
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchChange("");
    // Reset to page 1 when clearing search
    if (resetPagination) {
      resetPagination();
    }
  };

  return (
    <View className={cn("gap-3", className)}>
      {/* Main search input */}
      <View className="flex-row items-center gap-2">
        <View className="relative max-w-xl flex-1 rounded-md border border-gray-300">
          <View className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="text-muted-foreground" size={16} />
          </View>
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChangeText={handleSearchChange}
            className="pl-10"
          />
        </View>

        {/* Clear button */}
        {searchValue && (
          <Button variant="outline" size="sm" onPress={handleClear} className="flex-row gap-2">
            <X className="text-foreground" size={16} />
            <Text>Clear</Text>
          </Button>
        )}
      </View>
      {limitedFields && searchOptions.length > 0 && (
        <Text className="text-sm text-muted-foreground">
          Searchable fields: {searchOptions.map((opt) => opt.label).join(", ")}
        </Text>
      )}
    </View>
  );
}

export { SearchBar, type SearchBarProps, type SearchOption };
