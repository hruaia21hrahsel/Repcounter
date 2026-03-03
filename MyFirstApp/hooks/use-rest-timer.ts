import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useWorkoutStore } from '@/stores/workout-store';

export function useRestTimer() {
  const restTimerEndAt = useWorkoutStore((s) => s.restTimerEndAt);
  const clearRestTimer = useWorkoutStore((s) => s.clearRestTimer);
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!restTimerEndAt) {
      setRemaining(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((restTimerEndAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(intervalRef.current!);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        clearRestTimer();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restTimerEndAt]);

  const totalSecs = restTimerEndAt
    ? Math.ceil((restTimerEndAt - (Date.now() - remaining * 1000)) / 1000 + remaining)
    : 0;

  return {
    remaining,
    isActive: remaining > 0,
    skip: clearRestTimer,
  };
}
