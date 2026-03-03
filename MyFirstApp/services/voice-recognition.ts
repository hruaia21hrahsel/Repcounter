type CommandType = 'set' | 'increment' | 'reset';

interface ParsedCommand {
  type: CommandType;
  value?: number;
}

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

const INCREMENT_WORDS = ['rep', 'reps', 'done', 'next', 'count', 'and', 'add'];
const RESET_WORDS = ['reset', 'restart', 'clear', 'start over', 'zero'];

export function parseVoiceCommand(transcript: string): ParsedCommand | null {
  const lower = transcript.toLowerCase().trim();

  // Check for reset
  if (RESET_WORDS.some((w) => lower.includes(w))) {
    return { type: 'reset' };
  }

  // Check for number words first ("three", "five reps", etc.)
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (lower.includes(word)) {
      return { type: 'set', value };
    }
  }

  // Check for digit numbers ("3", "12 reps")
  const digitMatch = lower.match(/\b(\d+)\b/);
  if (digitMatch) {
    return { type: 'set', value: parseInt(digitMatch[1]) };
  }

  // Check for increment triggers
  if (INCREMENT_WORDS.some((w) => lower === w || lower.startsWith(w + ' ') || lower.endsWith(' ' + w))) {
    return { type: 'increment' };
  }

  return null;
}
