import { useCounterStore } from '@/stores/counter-store';
import { parseVoiceCommand } from '@/services/voice-recognition';
import * as Haptics from 'expo-haptics';

export function useRepCounter() {
  const store = useCounterStore();

  const handleTranscript = (transcript: string) => {
    const command = parseVoiceCommand(transcript);
    if (!command) return;

    store.setLastCommand(transcript);

    switch (command.type) {
      case 'set':
        store.setCount(command.value!);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'increment':
        store.increment();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'reset':
        store.reset();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  };

  return {
    count: store.count,
    listeningState: store.listeningState,
    lastCommand: store.lastCommand,
    confidence: store.confidence,
    setCount: store.setCount,
    increment: store.increment,
    reset: store.reset,
    setListeningState: store.setListeningState,
    setConfidence: store.setConfidence,
    handleTranscript,
  };
}
