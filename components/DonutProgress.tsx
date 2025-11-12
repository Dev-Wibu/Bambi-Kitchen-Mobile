import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  strokeWidth?: number;
  value: number; // current count
  total?: number; // optional total to compute percent
  color?: string;
  label?: string;
  centerValueFontSize?: number;
  centerLabelFontSize?: number;
};

export default function DonutProgress({
  size = 80,
  strokeWidth = 8,
  value,
  total,
  color = "#34D399",
  label,
  centerValueFontSize = 16,
  centerLabelFontSize = 12,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const percent =
    total && total > 0
      ? Math.min(100, Math.round((value / total) * 100))
      : Math.min(100, Math.round(value));
  const strokeDashoffset = circumference - (circumference * percent) / 100;

  return (
    <View style={{ width: size, alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ position: "relative", alignItems: "center" }}>
        <Text style={{ fontSize: centerValueFontSize, fontWeight: "700", color: "#111827" }}>
          {value}
        </Text>
        {label ? (
          <Text style={{ fontSize: centerLabelFontSize, color: "#6B7280" }}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}
