import { useState, useEffect } from 'react';
import { getRecentWorkouts } from '@/db/queries/workouts';

export function useHistory() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRecentWorkouts(50);
      setWorkouts(data);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Build calendar marks map: { '2026-03-01': { marked: true } }
  const markedDates: Record<string, { marked: boolean; dotColor: string }> = {};
  for (const w of workouts) {
    const date = new Date(w.startedAt).toISOString().slice(0, 10);
    markedDates[date] = { marked: true, dotColor: '#FF4D00' };
  }

  return { workouts, loading, markedDates, refresh: load };
}
