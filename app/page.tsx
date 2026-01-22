export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
      <h1 className="text-5xl font-bold">Six Degrees of History</h1>

      <p className="max-w-xl text-center text-slate-300">
        Connect historical events using logic, creativity, and strategy.
        Each play is judged by an AI referee.
      </p>

      <a
        href="/game"
        className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition"
      >
        Play
      </a>

      <div className="max-w-xl text-sm text-slate-400 text-center">
        Rules: You are dealt a hand of cards representing historical events.
        On your turn, connect an event to the chain. The AI judges the quality
        of your connection.
      </div>
    </main>
  );
}
