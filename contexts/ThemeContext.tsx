import { useColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { MMKV } from "react-native-mmkv";

// Initialize MMKV storage
const storage = new MMKV();

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = storage.getString("theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme !== "system") {
        setColorScheme(savedTheme);
      }
    }
  }, [setColorScheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storage.set("theme", newTheme);

    if (newTheme === "system") {
      // Reset to system default
      setColorScheme("system");
    } else {
      setColorScheme(newTheme);
    }
  };

  const isDark = colorScheme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
