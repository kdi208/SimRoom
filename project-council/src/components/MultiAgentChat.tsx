'use client';

import { useState, useRef, useEffect } from 'react';
import { usePersonaStore } from '@/src/store/persona-store';
import { PersonaBubble } from './PersonaBubble';
import { Send, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatTurn {
    id: string;
    type: 'user' | 'auto';
    userMessage: string; // Shown in UI
    prompt: string;      // Sent to API (if different)
    activePersonaIds: string[];
}

const MAX_AUTO_DEPTH = 2;

export default function MultiAgentChat() {
    const { personas } = usePersonaStore();
    const [input, setInput] = useState('');
    const [turns, setTurns] = useState<ChatTurn[]>([]);
    const [turnResponses, setTurnResponses] = useState<Record<string, Record<string, string>>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [turns]);

    // Automatic Debate Loop
    useEffect(() => {
        if (turns.length === 0) return;

        const lastTurn = turns[turns.length - 1];

        // Check if current turn is fully complete (all active personas responded)
        const responsesForTurn = turnResponses[lastTurn.id] || {};
        const isComplete = lastTurn.activePersonaIds.every(id => responsesForTurn[id]);

        if (isComplete) {
            // Calculate current auto-reply depth
            let depth = 0;
            for (let i = turns.length - 1; i >= 0; i--) {
                if (turns[i].type === 'auto') {
                    depth++;
                } else {
                    break;
                }
            }

            if (depth < MAX_AUTO_DEPTH) {
                // Small delay to make it feel natural
                const timer = setTimeout(() => {
                    triggerAutoReply(lastTurn);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [turns, turnResponses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const activePersonas = personas.filter((p) => p.isActive);
        if (activePersonas.length === 0) {
            alert('Please activate at least one persona to chat.');
            return;
        }

        const newTurn: ChatTurn = {
            id: Date.now().toString(),
            type: 'user',
            userMessage: input,
            prompt: input,
            activePersonaIds: activePersonas.map((p) => p.id),
        };

        setTurns((prev) => [...prev, newTurn]);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handlePersonaFinish = (turnId: string, personaId: string, content: string) => {
        setTurnResponses((prev) => ({
            ...prev,
            [turnId]: {
                ...prev[turnId],
                [personaId]: content
            }
        }));
    };

    const triggerAutoReply = (prevTurn: ChatTurn) => {
        const responses = turnResponses[prevTurn.id];
        if (!responses) return;

        // Construct debate context
        let debateContext = `[Previous Turn]: ${prevTurn.userMessage}\n\n`;
        Object.entries(responses).forEach(([pId, content]) => {
            const p = personas.find(params => params.id === pId);
            if (p) {
                debateContext += `[${p.name}]: ${content}\n`;
            }
        });

        debateContext += `\nInstructions: You are participating in a roundtable. Review the responses above. If you have a critical disagreement or an important build, state it CONCISELY. If you agree with everyone, say nothing or [AGREE].`;

        // Select a random active persona to respond (to avoid chaos of everyone talking at once)
        // PRD: "Mitigation: Implement a 'Speaking Order' or limit active personas to 3 max."
        const activeIds = prevTurn.activePersonaIds;
        const randomId = activeIds[Math.floor(Math.random() * activeIds.length)];

        const newTurn: ChatTurn = {
            id: Date.now().toString(),
            type: 'auto',
            userMessage: "🔥 Debate Round Initiated...",
            prompt: debateContext,
            activePersonaIds: [randomId],
        };

        setTurns((prev) => [...prev, newTurn]);
    };

    // Manual override wrapper
    const handleManualDebate = () => {
        const lastTurn = turns[turns.length - 1];
        if (lastTurn) triggerAutoReply(lastTurn);
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto p-4 gap-4">
            <div className="flex-1 overflow-y-auto space-y-8 pr-2" ref={scrollRef}>
                {turns.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <p>Select personas and say hello!</p>
                    </div>
                )}

                {turns.map((turn) => (
                    <div key={turn.id} className="space-y-4 animate-in fade-in duration-500">
                        {/* User Message */}
                        <div className="flex justify-end">
                            <div className={clsx(
                                "px-4 py-2 rounded-2xl max-w-[80%] shadow-sm flex items-start gap-2",
                                turn.type === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-muted text-muted-foreground rounded-tl-sm w-full justify-center italic text-sm"
                            )}>
                                <span>{turn.userMessage}</span>
                                {turn.type === 'user' && <UserIcon className="w-4 h-4 mt-1 opacity-70" />}
                            </div>
                        </div>


                        {/* Parallel Persona Responses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-muted/50">
                            {turn.activePersonaIds.map((personaId) => {
                                const persona = personas.find((p) => p.id === personaId);
                                if (!persona) return null;

                                // Construct history for this turn (all previous turns)
                                const turnIndex = turns.findIndex(t => t.id === turn.id);
                                const history = turns.slice(0, turnIndex).flatMap(prevTurn => {
                                    const msgs = [];
                                    // 1. The prompt for that turn
                                    msgs.push({ role: 'user', content: prevTurn.prompt || prevTurn.userMessage });

                                    // 2. The responses from that turn
                                    const prevResponses = turnResponses[prevTurn.id];
                                    if (prevResponses) {
                                        Object.entries(prevResponses).forEach(([pId, content]) => {
                                            const pName = personas.find(p => p.id === pId)?.name || 'Unknown';
                                            msgs.push({ role: 'assistant', content: `[${pName}]: ${content}` });
                                        });
                                    }
                                    return msgs;
                                });

                                return (
                                    <PersonaBubble
                                        key={`${turn.id}-${persona.id}`}
                                        persona={persona}
                                        userMessage={turn.prompt}
                                        history={history}
                                        onFinish={(content) => handlePersonaFinish(turn.id, persona.id, content)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4 bg-background space-y-2">
                {/* Debug info - remove later */}
                <div className="text-xs text-muted-foreground px-2">
                    Debug: Input length: {input.length} | Active personas: {personas.filter(p => p.isActive).length}
                </div>
                {/* Manual trigger hidden or optional - PRD wants automatic. Keeping hidden for now as handled by effect */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask the council..."
                        className="flex-1 min-h-[50px] max-h-[150px] p-3 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="px-4 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
