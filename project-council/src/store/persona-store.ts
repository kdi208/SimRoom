import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Persona, DEFAULT_PERSONAS } from '@/src/lib/types';

interface PersonaState {
    personas: Persona[];
    addPersona: (persona: Persona) => void;
    updatePersona: (id: string, updates: Partial<Persona>) => void;
    togglePersonaActive: (id: string) => void;
    deletePersona: (id: string) => void;
    resetToDefaults: () => void;
}

export const usePersonaStore = create<PersonaState>()(
    persist(
        (set) => ({
            personas: DEFAULT_PERSONAS,
            addPersona: (persona) =>
                set((state) => ({ personas: [...state.personas, persona] })),
            updatePersona: (id, updates) =>
                set((state) => ({
                    personas: state.personas.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),
            togglePersonaActive: (id) =>
                set((state) => ({
                    personas: state.personas.map((p) =>
                        p.id === id ? { ...p, isActive: !p.isActive } : p
                    ),
                })),
            deletePersona: (id) =>
                set((state) => ({
                    personas: state.personas.filter((p) => p.id !== id),
                })),
            resetToDefaults: () => set({ personas: DEFAULT_PERSONAS }),
        }),
        {
            name: 'project-council-storage',
        }
    )
);
