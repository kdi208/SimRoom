import MultiAgentChat from '@/src/components/MultiAgentChat';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b p-4 bg-card shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Project Council</h1>
      </div>
      <MultiAgentChat />
    </main>
  );
}
