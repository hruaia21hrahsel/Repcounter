import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { GymColors, GymGradients, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { parseVoiceCommand } from '@/services/voice-recognition';

type Stage = 'mode-select' | 'auto-setup' | 'auto-counting' | 'done' | 'manual-log-method' | 'manual-voice' | 'manual-tap';
type Mode = 'auto' | 'manual';

interface RepCounterModalProps {
  visible: boolean;
  exerciseName: string;
  setNumber: number;
  weight: string;
  weightUnit: string;
  onSave: (reps: number, method: 'auto' | 'voice' | 'manual') => void;
  onCancel: () => void;
}

const REP_PRESETS = [5, 6, 8, 10, 12, 15, 20];
const AUTO_INTERVAL_MS = 2000; // 2 seconds per rep

let SpeechModule: any = null;
let useSpeechEvent: any = null;
try {
  const mod = require('expo-speech-recognition');
  SpeechModule = mod.ExpoSpeechRecognitionModule;
  useSpeechEvent = mod.useSpeechRecognitionEvent;
} catch {}

export function RepCounterModal({
  visible,
  exerciseName,
  setNumber,
  weight,
  weightUnit,
  onSave,
  onCancel,
}: RepCounterModalProps) {
  const [stage, setStage] = useState<Stage>('mode-select');
  const [targetReps, setTargetReps] = useState(10);
  const [currentRep, setCurrentRep] = useState(0);
  const [finalReps, setFinalReps] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setStage('mode-select');
      setTargetReps(10);
      setCurrentRep(0);
      setFinalReps(0);
      setHeardText('');
      setIsListening(false);
    } else {
      stopAutoCount();
      stopListening();
    }
  }, [visible]);

  // Wire up speech events
  if (useSpeechEvent) {
    useSpeechEvent('result', (event: any) => {
      const transcript = event.results?.[0]?.transcript ?? '';
      setHeardText(transcript);
      const cmd = parseVoiceCommand(transcript);
      if (cmd?.type === 'set' && cmd.value !== undefined) {
        setFinalReps(cmd.value);
        stopListening();
        setStage('done');
      }
    });
    useSpeechEvent('end', () => setIsListening(false));
  }

  // Auto-counting logic
  const startAutoCount = () => {
    setCurrentRep(0);
    setStage('auto-counting');
    let count = 0;
    intervalRef.current = setInterval(() => {
      count += 1;
      setCurrentRep(count);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (count >= targetReps) {
        stopAutoCount();
        setFinalReps(count);
        setStage('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, AUTO_INTERVAL_MS);
  };

  const stopAutoCount = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopEarlyAuto = () => {
    stopAutoCount();
    setFinalReps(currentRep);
    setStage('done');
  };

  // Voice listening
  const startListening = async () => {
    if (!SpeechModule) {
      Alert.alert('Not Available', 'Voice input requires a dev build. Use manual input instead.');
      setStage('manual-tap');
      return;
    }
    const { granted } = await SpeechModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Allow microphone access for voice logging.');
      return;
    }
    setIsListening(true);
    setHeardText('');
    SpeechModule.start({ lang: 'en-US', interimResults: true, continuous: false });
  };

  const stopListening = () => {
    if (SpeechModule && isListening) {
      SpeechModule.abort();
    }
    setIsListening(false);
  };

  const handleSave = (method: 'auto' | 'voice' | 'manual') => {
    onSave(finalReps, method);
  };

  // ─── Render stages ────────────────────────────────────────────────

  const header = (
    <View style={styles.header}>
      <Text style={styles.exerciseName}>{exerciseName}</Text>
      <Text style={styles.setInfo}>
        Set {setNumber} · {weight} {weightUnit}
      </Text>
    </View>
  );

  // Stage 1 — pick mode
  if (stage === 'mode-select') {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <Text style={styles.question}>How do you want to count?</Text>
            <View style={styles.modeRow}>
              {/* Auto */}
              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => setStage('auto-setup')}
                activeOpacity={0.8}
              >
                <Text style={styles.modeEmoji}>🤖</Text>
                <Text style={styles.modeTitle}>Auto</Text>
                <Text style={styles.modeDesc}>Set your target and the counter runs automatically</Text>
              </TouchableOpacity>
              {/* Manual */}
              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => setStage('manual-log-method')}
                activeOpacity={0.8}
              >
                <Text style={styles.modeEmoji}>✋</Text>
                <Text style={styles.modeTitle}>Manual</Text>
                <Text style={styles.modeDesc}>Log your reps after you finish the set</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Stage 2a — auto setup: pick target reps
  if (stage === 'auto-setup') {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setStage('mode-select')}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <Text style={styles.question}>How many reps?</Text>
            <View style={styles.repPresetsGrid}>
              {REP_PRESETS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.repPreset, targetReps === r && styles.repPresetActive]}
                  onPress={() => setTargetReps(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.repPresetText, targetReps === r && styles.repPresetTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom +/- */}
            <View style={styles.customRow}>
              <TouchableOpacity
                style={styles.adjBtn}
                onPress={() => setTargetReps((v) => Math.max(1, v - 1))}
              >
                <Text style={styles.adjBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.customVal}>{targetReps}</Text>
              <TouchableOpacity
                style={styles.adjBtn}
                onPress={() => setTargetReps((v) => v + 1)}
              >
                <Text style={styles.adjBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={startAutoCount} activeOpacity={0.85} style={styles.primaryWrapper}>
              <LinearGradient colors={GymGradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                <IconSymbol name="play.fill" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Start Counting</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStage('mode-select')} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Stage 2b — auto counting in progress
  if (stage === 'auto-counting') {
    const progress = targetReps > 0 ? currentRep / targetReps : 0;
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <View style={styles.countingCenter}>
              <Text style={styles.bigCount}>{currentRep}</Text>
              <Text style={styles.bigCountOf}>of {targetReps}</Text>
              {/* Simple progress bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.paceNote}>~2 sec / rep</Text>
            </View>
            <TouchableOpacity onPress={stopEarlyAuto} style={styles.stopBtn} activeOpacity={0.8}>
              <IconSymbol name="stop.fill" size={18} color={GymColors.danger} />
              <Text style={styles.stopBtnText}>Stop Early</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Stage 3 — manual: choose log method
  if (stage === 'manual-log-method') {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setStage('mode-select')}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <Text style={styles.question}>Finish your set, then log your reps.</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => { setStage('manual-voice'); startListening(); }}
                activeOpacity={0.8}
              >
                <Text style={styles.modeEmoji}>🎤</Text>
                <Text style={styles.modeTitle}>Voice</Text>
                <Text style={styles.modeDesc}>Say the number of reps you did</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => { setFinalReps(0); setStage('manual-tap'); }}
                activeOpacity={0.8}
              >
                <Text style={styles.modeEmoji}>✏️</Text>
                <Text style={styles.modeTitle}>Manual</Text>
                <Text style={styles.modeDesc}>Tap the number of reps completed</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setStage('mode-select')} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Stage 4a — manual voice listening
  if (stage === 'manual-voice') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <View style={styles.countingCenter}>
              <TouchableOpacity
                onPress={isListening ? stopListening : startListening}
                style={[styles.micCircle, isListening && styles.micCircleActive]}
                activeOpacity={0.8}
              >
                <IconSymbol name={isListening ? 'stop.fill' : 'mic.fill'} size={36} color={isListening ? GymColors.danger : GymColors.primary} />
              </TouchableOpacity>
              <Text style={styles.voicePrompt}>
                {isListening ? 'Listening...' : 'Tap to listen'}
              </Text>
              {heardText.length > 0 && (
                <Text style={styles.heardText}>Heard: "{heardText}"</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => { stopListening(); setStage('manual-tap'); }} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Switch to manual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Stage 4b — manual tap to enter reps
  if (stage === 'manual-tap') {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <Text style={styles.question}>How many reps did you do?</Text>

            {/* Quick presets */}
            <View style={styles.repPresetsGrid}>
              {REP_PRESETS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.repPreset, finalReps === r && styles.repPresetActive]}
                  onPress={() => setFinalReps(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.repPresetText, finalReps === r && styles.repPresetTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom +/- */}
            <View style={styles.customRow}>
              <TouchableOpacity
                style={styles.adjBtn}
                onPress={() => setFinalReps((v) => Math.max(0, v - 1))}
              >
                <Text style={styles.adjBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.customVal}>{finalReps}</Text>
              <TouchableOpacity
                style={styles.adjBtn}
                onPress={() => setFinalReps((v) => v + 1)}
              >
                <Text style={styles.adjBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleSave('manual')}
              disabled={finalReps === 0}
              activeOpacity={0.85}
              style={[styles.primaryWrapper, finalReps === 0 && { opacity: 0.4 }]}
            >
              <LinearGradient colors={GymGradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                <IconSymbol name="checkmark" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Save Set</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStage('manual-log-method')} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Stage 5 — done (auto or voice finished)
  if (stage === 'done') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {header}
            <View style={styles.countingCenter}>
              <Text style={styles.doneEmoji}>✅</Text>
              <Text style={styles.doneReps}>{finalReps}</Text>
              <Text style={styles.doneLabel}>reps completed</Text>
            </View>

            {/* Adjust if needed */}
            <View style={styles.customRow}>
              <TouchableOpacity
                style={styles.adjBtn}
                onPress={() => setFinalReps((v) => Math.max(0, v - 1))}
              >
                <Text style={styles.adjBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.customVal}>{finalReps}</Text>
              <TouchableOpacity
                style={styles.adjBtn}
                onPress={() => setFinalReps((v) => v + 1)}
              >
                <Text style={styles.adjBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.adjustHint}>Adjust if needed</Text>

            <TouchableOpacity
              onPress={() => handleSave(intervalRef.current === null ? 'auto' : 'manual')}
              activeOpacity={0.85}
              style={styles.primaryWrapper}
            >
              <LinearGradient colors={GymGradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                <IconSymbol name="checkmark" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Save Set</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: GymColors.elevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  exerciseName: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  setInfo: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
  },
  question: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modeCard: {
    flex: 1,
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  modeEmoji: {
    fontSize: 32,
  },
  modeTitle: {
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  modeDesc: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  repPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  repPreset: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: GymColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GymColors.border,
  },
  repPresetActive: {
    backgroundColor: GymColors.primary,
    borderColor: GymColors.primary,
  },
  repPresetText: {
    color: GymColors.textMuted,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  repPresetTextActive: {
    color: GymColors.textPrimary,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  adjBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.card,
    borderWidth: 1,
    borderColor: GymColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjBtnText: {
    color: GymColors.textPrimary,
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  customVal: {
    color: GymColors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    minWidth: 60,
    textAlign: 'center',
  },
  primaryWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  primaryBtnText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  countingCenter: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  bigCount: {
    color: GymColors.textPrimary,
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 104,
    letterSpacing: -3,
  },
  bigCountOf: {
    color: GymColors.textMuted,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: GymColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GymColors.primary,
    borderRadius: BorderRadius.full,
  },
  paceNote: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: GymColors.danger + '18',
    borderWidth: 1,
    borderColor: GymColors.danger + '40',
  },
  stopBtnText: {
    color: GymColors.danger,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  micCircle: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.card,
    borderWidth: 2,
    borderColor: GymColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircleActive: {
    borderColor: GymColors.danger,
    backgroundColor: GymColors.danger + '15',
  },
  voicePrompt: {
    color: GymColors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  heardText: {
    color: GymColors.textMuted,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  doneEmoji: {
    fontSize: 52,
  },
  doneReps: {
    color: GymColors.success,
    fontSize: 80,
    fontWeight: '900',
    lineHeight: 88,
    letterSpacing: -2,
  },
  doneLabel: {
    color: GymColors.textMuted,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  adjustHint: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: -Spacing.xs,
  },
});
