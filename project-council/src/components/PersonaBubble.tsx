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
        streamProtocol: 'text',
        onFinish: (prompt, completion) => {
            onFinish?.(completion);
        },
    });

    const hasTriggeredRef = useRef(false);
    const lastUserMessageRef = useRef('');

    // Trigger completion on mount
    useEffect(() => {
        // If we haven't started (no completion, not loading, no error), trigger it.
        // We rely on the parent giving us a unique key per turn so we don't need to track prop changes.
        if (!completion && !isLoading && !error) {
            complete(userMessage, {
                body: {
                    systemPrompt: persona.systemInstruction,
                    history: history,
                }
            });
        }
    }, []); // Run once on mount

    return (
        <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-left-2 duration-300">
            {/* Avatar */}
            <div className={twMerge(
                "w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-md",
                persona.avatarColor
            )}>
                {persona.name.charAt(0)}
            </div>

            {/* Message Bubble */}
            <div className="flex flex-col gap-1 min-w-0">
                {/* Name and Role */}
                <div className="flex items-center gap-2 pl-1">
                    <span className="font-semibold text-sm">{persona.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {persona.role}
                    </span>
                </div>

                {/* Chat Bubble */}
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {!completion && isLoading && (
                            <span className="text-muted-foreground italic flex items-center gap-2">
                                <span className="flex gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </span>
                        )}
                        {completion}
                        {isLoading && completion && <span className="animate-pulse ml-1">▋</span>}
                        {error && <span className="text-destructive text-xs block mt-2">Error: {error.message}</span>}
                        {!completion && !isLoading && !error && (
                            <span className="text-muted-foreground italic">Waiting...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
