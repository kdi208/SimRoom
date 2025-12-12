import { usePersonaStore } from '@/src/store/persona-store';
import { Persona } from '@/src/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
    persona: Persona;
    onEdit?: (persona: Persona) => void;
}

export function PersonaCard({ persona, onEdit }: PersonaCardProps) {
    const { togglePersonaActive, deletePersona } = usePersonaStore();

    return (
        <Card className={cn("w-full transition-all duration-200", persona.isActive ? "border-primary/50 shadow-md" : "opacity-70")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <Avatar className={cn("h-8 w-8", persona.avatarColor)}>
                        <AvatarFallback className="text-white text-xs">
                            {persona.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <CardTitle className="text-sm font-medium leading-none">
                            {persona.name}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">{persona.role}</span>
                    </div>
                </div>
                <Switch
                    checked={persona.isActive}
                    onCheckedChange={() => togglePersonaActive(persona.id)}
                />
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                    {persona.systemInstruction}
                </p>
                <div className="flex justify-end mt-4 space-x-2">
                    {onEdit && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(persona)}>
                            <Edit className="h-3 w-3" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deletePersona(persona.id)}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
