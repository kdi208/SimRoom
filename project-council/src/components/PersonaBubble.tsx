'use client';

import { useCompletion } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { Persona } from '@/src/lib/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PersonaBubbleProps {
    persona: Persona;
    userMessage: string;
    history?: any[];
    onFinish?: (content: string) => void;
}

export function PersonaBubble({ persona, userMessage, history = [], onFinish }: PersonaBubbleProps) {
    const { completion, complete, isLoading, error } = useCompletion({
        api: '/api/chat/persona',
        onFinish: (prompt, completion) => {
            onFinish?.(completion);
        },
    });

    const hasTriggeredRef = useRef(false);
    const lastUserMessageRef = useRef('');

    // Trigger completion when userMessage changes and is not empty
    useEffect(() => {
        if (userMessage && userMessage !== lastUserMessageRef.current) {
            lastUserMessageRef.current = userMessage;
            complete(userMessage, {
                body: {
                    systemPrompt: persona.systemInstruction,
                    history: history,
                }
            });
        }
    }, [userMessage, complete, persona.systemInstruction, history]);

    // Only hide if we have nothing: no completion, no loading, and no error
    if (!completion && !isLoading && !error) {
        return null;
    }

    return (
        <div className="flex gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={twMerge("w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 font-bold", persona.avatarColor)}>
                {persona.name.charAt(0)}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{persona.name}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                        {persona.role}
                    </span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {completion}
                    {isLoading && <span className="animate-pulse ml-1">▋</span>}
                    {error && <span className="text-destructive text-xs block mt-2">Error: {error.message}</span>}
                </div>
            </div>
        </div>
    );
}
