import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { GymColors, FontSize } from '@/constants/theme';

interface RepCountDisplayProps {
  count: number;
}

export function RepCountDisplay({ count }: RepCountDisplayProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 40,
          bounciness: 12,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
      ]).start();
      prevCount.current = count;
    }
  }, [count]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.number, { transform: [{ scale: scaleAnim }] }]}>
        {count}
      </Animated.Text>
      <Text style={styles.label}>REPS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: GymColors.textPrimary,
    fontSize: 120,
    fontWeight: '900',
    lineHeight: 130,
    letterSpacing: -4,
  },
  label: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: -8,
  },
});
