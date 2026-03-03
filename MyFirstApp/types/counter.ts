export type CounterMode = 'voice' | 'manual';
export type ListeningState = 'idle' | 'listening' | 'processing';

export interface CounterState {
  count: number;
  mode: CounterMode;
  listeningState: ListeningState;
  confidence: number;
  lastCommand: string;
}
