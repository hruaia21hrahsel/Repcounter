import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { GymColors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { ActiveSet } from '@/types/workout';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SetRowProps {
  set: ActiveSet;
  weightUnit: string;
  onWeightChange: (val: string) => void;
  onRepsChange: (val: string) => void;
  onComplete: () => void;
  onDelete: () => void;
}

export function SetRow({
  set,
  weightUnit,
  onWeightChange,
  onRepsChange,
  onComplete,
  onDelete,
}: SetRowProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onComplete();
  };

  const rowStyle = set.isDone
    ? [styles.row, styles.rowDone]
    : set.isPR
    ? [styles.row, styles.rowPR]
    : styles.row;

  return (
    <Animated.View style={[rowStyle, { transform: [{ scale: scaleAnim }] }]}>
      {/* Set number */}
      <View style={styles.setNum}>
        <Text style={styles.setNumText}>{set.setNumber}</Text>
      </View>

      {/* Weight input */}
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, set.isDone && styles.inputDone]}
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

      <Text style={styles.cross}>×</Text>

      {/* Reps input */}
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, set.isDone && styles.inputDone]}
          value={set.reps}
          onChangeText={onRepsChange}
          keyboardType="number-pad"
          editable={!set.isDone}
          selectTextOnFocus
          placeholder="0"
          placeholderTextColor={GymColors.textMuted}
        />
        <Text style={styles.unit}>reps</Text>
      </View>

      {/* PR badge */}
      {set.isPR && (
        <View style={styles.prBadge}>
          <Text style={styles.prText}>PR!</Text>
        </View>
      )}

      {/* Checkmark / done button */}
      <TouchableOpacity
        onPress={set.isDone ? undefined : handleComplete}
        style={[styles.checkBtn, set.isDone && styles.checkBtnDone]}
        activeOpacity={0.7}
        disabled={set.isDone}
      >
        <IconSymbol
          name="checkmark"
          size={16}
          color={set.isDone ? GymColors.success : GymColors.textMuted}
        />
      </TouchableOpacity>

      {/* Delete */}
      {!set.isDone && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.7}>
          <IconSymbol name="xmark" size={14} color={GymColors.danger} />
        </TouchableOpacity>
      )}
    </Animated.View>
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
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: GymColors.border,
    gap: Spacing.xs,
  },
  rowDone: {
    borderColor: GymColors.success + '60',
    backgroundColor: GymColors.success + '10',
  },
  rowPR: {
    borderColor: GymColors.accent + '80',
    backgroundColor: GymColors.accent + '10',
  },
  setNum: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumText: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  inputWrap: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  input: {
    flex: 1,
    backgroundColor: GymColors.elevated,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    color: GymColors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: GymColors.border,
    minWidth: 56,
  },
  inputDone: {
    opacity: 0.6,
    borderColor: 'transparent',
  },
  unit: {
    color: GymColors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  cross: {
    color: GymColors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '300',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: GymColors.elevated,
    borderWidth: 1.5,
    borderColor: GymColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: GymColors.success + '20',
    borderColor: GymColors.success,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
});
