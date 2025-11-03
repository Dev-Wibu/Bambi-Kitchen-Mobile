import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ReloadButtonProps extends TouchableOpacityProps {
  onRefresh: () => void;
  size?: number;
  iconColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export default function ReloadButton({
  onRefresh,
  size = 28,
  iconColor = "#FF6D00",
  backgroundColor = "#F3F4F6",
  borderRadius = 24,
  padding = 8,
  style,
  ...props
}: ReloadButtonProps) {
  return (
    <TouchableOpacity
      onPress={onRefresh}
      style={[
        {
          backgroundColor,
          borderRadius,
          padding,
        },
        style,
      ]}
      {...props}>
      <MaterialIcons name="refresh" size={size} color={iconColor} />
    </TouchableOpacity>
  );
}
