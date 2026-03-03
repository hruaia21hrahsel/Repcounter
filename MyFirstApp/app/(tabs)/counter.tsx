import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { GymColors, GymGradients, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { RepCountDisplay } from '@/components/counter/rep-count-display';
import { VoiceWaveform } from '@/components/counter/voice-waveform';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRepCounter } from '@/hooks/use-rep-counter';

// Conditional import for speech recognition — unavailable in Expo Go / web
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;
try {
  const mod = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {}

export default function CounterScreen() {
  const insets = useSafeAreaInsets();
  const {
    count,
    listeningState,
    lastCommand,
    increment,
    reset,
    setListeningState,
    setConfidence,
    handleTranscript,
  } = useRepCounter();

  const isListening = listeningState === 'listening';
  const isSupported = Platform.OS !== 'web' && !!ExpoSpeechRecognitionModule;

  // Wire up speech recognition events
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent('result', (event: any) => {
      const transcript = event.results?.[0]?.transcript ?? '';
      setConfidence(event.results?.[0]?.confidence ?? 0);
      handleTranscript(transcript);
    });

    useSpeechRecognitionEvent('end', () => {
      setListeningState('idle');
    });

    useSpeechRecognitionEvent('error', (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setListeningState('idle');
    });
  }

  const toggleListening = async () => {
    if (!isSupported) {
      Alert.alert(
        'Not Available',
        'Voice recognition requires a development build (not Expo Go). Use the manual +/- buttons instead.',
      );
      return;
    }

    if (isListening) {
      ExpoSpeechRecognitionModule.abort();
      setListeningState('idle');
    } else {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please allow microphone access for voice rep counting.');
        return;
      }
      setListeningState('listening');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
      });
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rep Counter</Text>
        <Text style={styles.subtitle}>Voice or manual — your choice</Text>
      </View>

      {/* Rep count display */}
      <View style={styles.countSection}>
        <RepCountDisplay count={count} />
      </View>

      {/* Waveform */}
      <VoiceWaveform listeningState={listeningState} />

      {/* Last command */}
      {lastCommand.length > 0 && (
        <Text style={styles.lastCommand}>Heard: "{lastCommand}"</Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Manual +/- */}
        <View style={styles.manualRow}>
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() => useRepCounter().setCount(Math.max(0, count - 1))}
            activeOpacity={0.7}
          >
            <Text style={styles.manualBtnText}>−</Text>
          </TouchableOpacity>

          {/* Mic button */}
          <TouchableOpacity onPress={toggleListening} activeOpacity={0.85} style={styles.micWrapper}>
            <LinearGradient
              colors={isListening ? [GymColors.danger, '#FF6B6B'] : GymGradients.primary}
              style={styles.micBtn}
            >
              <IconSymbol
                name={isListening ? 'stop.fill' : 'mic.fill'}
                size={28}
                color={GymColors.textPrimary}
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manualBtn} onPress={increment} activeOpacity={0.7}>
            <Text style={styles.manualBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Reset button */}
        <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.7}>
          <IconSymbol name="arrow.counterclockwise" size={16} color={GymColors.textMuted} />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Voice commands:</Text>
        <Text style={styles.instructionText}>• "rep" or "done" — increment by 1</Text>
        <Text style={styles.instructionText}>• "three", "five", "10" — set count directly</Text>
        <Text style={styles.instructionText}>• "reset" — reset to zero</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GymColors.background,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  title: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
  countSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastCommand: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  manualBtn: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    borderWidth: 1,
    borderColor: GymColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualBtnText: {
    color: GymColors.textPrimary,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  micWrapper: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  resetText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  instructions: {
    alignSelf: 'stretch',
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 6,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  instructionTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
  },
});
