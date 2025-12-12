export type Persona = {
  id: string;
  name: string;
  role: string; // e.g., "CFO", "The Skeptic"
  avatarColor: string; // Hex code or Tailwind class
  systemInstruction: string;
  isActive: boolean;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  personaId?: string; // If assistant, which persona?
  content: string;
  createdAt: number;
};

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: '1',
    name: 'Marcus',
    role: 'CFO',
    avatarColor: 'bg-red-500',
    systemInstruction:
      'You are a cynical CFO. You always ask about ROI. You use short sentences. You are skeptical of the CEO and new ideas. You focus on cost-cutting and risk.',
    isActive: true,
  },
  {
    id: '2',
    name: 'Sarah',
    role: 'CEO',
    avatarColor: 'bg-blue-500',
    systemInstruction:
      'You are a visionary CEO. You are optimistic, focus on growth and big picture. You often use metaphors. You want to move fast.',
    isActive: true,
  },
  {
    id: '3',
    name: 'Elena',
    role: 'Creative Director',
    avatarColor: 'bg-purple-500',
    systemInstruction:
      'You are an avant-garde Creative Director. You care about aesthetics, user feelings, and "the vibe". you dislike corporate speak.',
    isActive: false,
  },
];
