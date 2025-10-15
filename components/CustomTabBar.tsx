import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type CustomTabBarProps = BottomTabBarProps & {
  hiddenRoutes?: string[];
};

export function CustomTabBar({ state, descriptors, navigation, hiddenRoutes }: CustomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        borderTopWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}>
      <View
        style={{
          flexDirection: "row",
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          paddingHorizontal: 8,
        }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip hidden routes
          if (hiddenRoutes?.includes(route.name) || (options as any).href === null) {
            return null;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const iconName = options.tabBarIcon
            ? (options.tabBarIcon as any)({ color: "", size: 24 }).props.name
            : ("circle" as any);

          return (
            <TabBarButton
              key={route.key}
              isFocused={isFocused}
              iconName={iconName}
              label={options.title || route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabBarButtonProps {
  isFocused: boolean;
  iconName: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
  isDark: boolean;
}

const TabBarButton = ({
  isFocused,
  iconName,
  label,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
  isDark,
}: Readonly<TabBarButtonProps>) => {
  const scale = useSharedValue(1);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isFocused ? 1.1 : 1) }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0.7, { duration: 200 }),
      transform: [{ scale: withSpring(isFocused ? 1.05 : 1) }],
    };
  });

  const inactiveColor = isDark ? "#6B7280" : "#9CA3AF";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={{ flex: 1, alignItems: "center" }}>
      <Animated.View
        style={[
          containerAnimatedStyle,
          {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 16,
            minWidth: 64,
          },
        ]}>
        {isFocused && (
          <LinearGradient
            colors={["#FF8A00", "#FF6D00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 16,
              opacity: isDark ? 0.25 : 0.15,
            }}
          />
        )}
        <Animated.View style={animatedIconStyle}>
          <MaterialIcons
            name={iconName as any}
            size={24}
            color={isFocused ? "#FF6D00" : inactiveColor}
            style={{ marginBottom: 4 }}
          />
        </Animated.View>
        <Animated.Text
          style={[
            animatedTextStyle,
            {
              fontSize: 11,
              fontWeight: isFocused ? "600" : "400",
              color: isFocused ? "#FF6D00" : inactiveColor,
            },
          ]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};
