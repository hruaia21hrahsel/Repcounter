import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  unit?: string;
}

export function ProgressChart({ data, title, unit = 'kg' }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data yet. Log some sets to see progress!</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;
  const chartH = 120;
  const chartW = width - 64;
  const step = chartW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: i * step,
    y: chartH - ((d.value - minVal) / range) * (chartH - 20) - 10,
    value: d.value,
    date: d.date,
  }));

  const pathD = points.reduce((acc, p, i) => {
    return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{maxVal.toFixed(0)}{unit}</Text>
          <Text style={styles.axisLabel}>{((maxVal + minVal) / 2).toFixed(0)}{unit}</Text>
          <Text style={styles.axisLabel}>{minVal.toFixed(0)}{unit}</Text>
        </View>
        {/* Data visualization — simple bar chart fallback */}
        <View style={styles.bars}>
          {data.slice(-10).map((d, i) => {
            const heightPct = ((d.value - minVal) / range) * 0.8 + 0.2;
            return (
              <View key={i} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    { height: chartH * heightPct },
                    i === data.length - 1 && styles.barLatest,
                  ]}
                />
                <Text style={styles.barLabel}>{d.date.slice(5)}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {/* Latest value */}
      {data.length > 0 && (
        <Text style={styles.latestValue}>
          Latest: <Text style={styles.latestNumber}>{data[data.length - 1].value.toFixed(1)} {unit}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: GymColors.border,
    gap: Spacing.sm,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  chart: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 120,
  },
  axisLabel: {
    color: GymColors.textMuted,
    fontSize: 10,
    width: 36,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  bar: {
    width: '100%',
    backgroundColor: GymColors.primary + '60',
    borderRadius: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLatest: {
    backgroundColor: GymColors.primary,
  },
  barLabel: {
    color: GymColors.textMuted,
    fontSize: 8,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  latestValue: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
  latestNumber: {
    color: GymColors.primary,
    fontWeight: '700',
  },
});
