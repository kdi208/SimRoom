import MultiAgentChat from '@/src/components/MultiAgentChat';
import { PersonaSidebar } from '@/src/components/persona-sidebar';

export default function Home() {
  return (
    <main className="flex h-screen bg-background overflow-hidden">
      <div className="w-80 border-r bg-muted/5 hidden md:block">
        <PersonaSidebar />
      </div>
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b p-4 bg-card shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold text-center">SimRoom</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <MultiAgentChat />
        </div>
      </div>
    </main>
  );
}
