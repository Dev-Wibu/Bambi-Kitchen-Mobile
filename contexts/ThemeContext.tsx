import { useThemeStore } from "@/stores/themeStore";
import { useColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { theme, setTheme: setThemeStore } = useThemeStore();

  // Apply theme changes to NativeWind
  useEffect(() => {
    if (theme === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeStore(newTheme);
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
