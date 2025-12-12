'use client';

import { useState } from 'react';
import { usePersonaStore } from '@/src/store/persona-store';
import { PersonaCard } from './persona-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Persona } from '@/src/lib/types';

export function PersonaSidebar() {
    const { personas, addPersona } = usePersonaStore();
    const [isOpen, setIsOpen] = useState(false);
    const [newPersona, setNewPersona] = useState<Partial<Persona>>({
        name: '',
        role: '',
        systemInstruction: '',
        avatarColor: 'bg-slate-500',
    });

    const handleCreate = () => {
        if (!newPersona.name || !newPersona.systemInstruction) return;

        addPersona({
            id: crypto.randomUUID(),
            name: newPersona.name,
            role: newPersona.role || 'Participant',
            avatarColor: newPersona.avatarColor || 'bg-slate-500',
            systemInstruction: newPersona.systemInstruction,
            isActive: true,
        } as Persona);

        setIsOpen(false);
        setNewPersona({ name: '', role: '', systemInstruction: '', avatarColor: 'bg-slate-500' });
    };

    return (
        <div className="h-full flex flex-col border-r bg-muted/10">
            <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <h2 className="font-semibold tracking-tight">Council Members</h2>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add New Persona</SheetTitle>
                            <SheetDescription>
                                Define the personality and role of your new AI council member.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newPersona.name}
                                    onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                                    placeholder="e.g. Marcus"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    value={newPersona.role}
                                    onChange={(e) => setNewPersona({ ...newPersona, role: e.target.value })}
                                    placeholder="e.g. The Skeptical CFO"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instruction">System Instruction (Personality)</Label>
                                <Textarea
                                    id="instruction"
                                    value={newPersona.systemInstruction}
                                    onChange={(e) => setNewPersona({ ...newPersona, systemInstruction: e.target.value })}
                                    placeholder="You are a grumpy lawyer who only cares about liability..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color Code (Tailwind)</Label>
                                <div className="flex gap-2">
                                    {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'].map(color => (
                                        <div
                                            key={color}
                                            onClick={() => setNewPersona({ ...newPersona, avatarColor: color })}
                                            className={`w-6 h-6 rounded-full cursor-pointer ${color} ${newPersona.avatarColor === color ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create Persona</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {personas.map((persona) => (
                    <PersonaCard key={persona.id} persona={persona} />
                ))}
                {personas.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        No personas created. Add one to start.
                    </div>
                )}
            </div>
        </div>
    );
}
