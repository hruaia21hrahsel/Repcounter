import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { GymColors } from '@/constants/theme';
import { ListeningState } from '@/types/counter';

interface VoiceWaveformProps {
  listeningState: ListeningState;
}

const BAR_COUNT = 7;

export function VoiceWaveform({ listeningState }: VoiceWaveformProps) {
  const anims = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.2))).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (listeningState === 'listening') {
      const animations = anims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 80),
            Animated.timing(anim, {
              toValue: 1,
              duration: 300 + i * 40,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: 300 + i * 40,
              useNativeDriver: true,
            }),
          ]),
        ),
      );
      loopRef.current = Animated.parallel(animations);
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      anims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }

    return () => loopRef.current?.stop();
  }, [listeningState]);

  const barColor = listeningState === 'listening' ? GymColors.primary : GymColors.border;

  return (
    <View style={styles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
  },
  bar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
});
