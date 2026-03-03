import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GymColors, GymGradients, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { ActiveSet } from '@/types/workout';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SetRowProps {
  set: ActiveSet;
  weightUnit: string;
  onWeightChange: (val: string) => void;
  onStart: () => void;
  onDelete: () => void;
}

export function SetRow({ set, weightUnit, onWeightChange, onStart, onDelete }: SetRowProps) {
  return (
    <View style={[styles.row, set.isDone && styles.rowDone]}>
      {/* Set number */}
      <View style={[styles.setNum, set.isDone && styles.setNumDone]}>
        {set.isDone
          ? <IconSymbol name="checkmark" size={14} color={GymColors.success} />
          : <Text style={styles.setNumText}>{set.setNumber}</Text>
        }
      </View>

      {/* Weight input */}
      <View style={styles.weightWrap}>
        <TextInput
          style={[styles.weightInput, set.isDone && styles.inputDone]}
          value={set.weight}
          onChangeText={onWeightChange}
          keyboardType="decimal-pad"
          editable={!set.isDone}
          selectTextOnFocus
          placeholder="0"
          placeholderTextColor={GymColors.textMuted}
        />
        <Text style={styles.unit}>{weightUnit}</Text>
      </View>

      {/* Done: show reps logged */}
      {set.isDone ? (
        <View style={styles.doneInfo}>
          <Text style={styles.doneReps}>{set.reps} reps</Text>
          {set.isPR && (
            <View style={styles.prBadge}>
              <Text style={styles.prText}>PR!</Text>
            </View>
          )}
        </View>
      ) : (
        /* Start button */
        <TouchableOpacity onPress={onStart} activeOpacity={0.85} style={styles.startWrapper}>
          <LinearGradient
            colors={GymGradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtn}
          >
            <IconSymbol name="play.fill" size={13} color={GymColors.textPrimary} />
            <Text style={styles.startText}>Start</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Delete (only if not done) */}
      {!set.isDone && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.7}>
          <IconSymbol name="xmark" size={13} color={GymColors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GymColors.card,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: GymColors.border,
    gap: Spacing.sm,
  },
  rowDone: {
    borderColor: GymColors.success + '50',
    backgroundColor: GymColors.success + '08',
  },
  setNum: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumDone: {
    backgroundColor: GymColors.success + '20',
  },
  setNumText: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  weightWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weightInput: {
    flex: 1,
    backgroundColor: GymColors.elevated,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: GymColors.border,
    minWidth: 60,
  },
  inputDone: {
    opacity: 0.5,
    borderColor: 'transparent',
  },
  unit: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '500',
    minWidth: 24,
  },
  doneInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  doneReps: {
    color: GymColors.success,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  prBadge: {
    backgroundColor: GymColors.accent + '25',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prText: {
    color: GymColors.accent,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  startWrapper: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
  },
  startText: {
    color: GymColors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
