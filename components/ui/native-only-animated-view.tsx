import type { ComponentProps, ReactNode } from "react";
import { Platform } from "react-native";
import Animated from "react-native-reanimated";

/**
 * This component is used to wrap animated views that should only be animated on native.
 * @param props - The props for the animated view.
 * @returns The animated view if the platform is native, otherwise the children.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
type AnimatedViewProps = ComponentProps<typeof Animated.View> & React.RefAttributes<Animated.View>;

function NativeOnlyAnimatedView({ children, pointerEvents, style, ...rest }: AnimatedViewProps) {
  if (Platform.OS === "web") {
    return <>{children as ReactNode}</>;
  }

  const mergedStyle = pointerEvents
    ? ([style, { pointerEvents }] as unknown as AnimatedViewProps["style"])
    : style;

  return (
    <Animated.View {...rest} style={mergedStyle}>
      {children}
    </Animated.View>
  );
}

export { NativeOnlyAnimatedView };
