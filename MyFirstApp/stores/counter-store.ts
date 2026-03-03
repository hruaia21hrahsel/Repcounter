import { create } from 'zustand';
import { CounterState, ListeningState } from '@/types/counter';

interface CounterStore extends CounterState {
  setCount: (count: number) => void;
  increment: () => void;
  reset: () => void;
  setListeningState: (state: ListeningState) => void;
  setLastCommand: (command: string) => void;
  setConfidence: (confidence: number) => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  mode: 'voice',
  listeningState: 'idle',
  confidence: 0,
  lastCommand: '',

  setCount: (count) => set({ count }),
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0, lastCommand: 'reset', listeningState: 'idle' }),
  setListeningState: (listeningState) => set({ listeningState }),
  setLastCommand: (lastCommand) => set({ lastCommand }),
  setConfidence: (confidence) => set({ confidence }),
}));
