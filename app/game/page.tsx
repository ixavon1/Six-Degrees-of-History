export default function GamePage() {
  return (
    <main className="min-h-screen bg-slate-800 text-white p-8">
      <h2 className="text-3xl mb-4">Game</h2>

      <p className="text-slate-300">
        Backend not connected yet. Pretend you have cards.
      </p>

      <div className="flex gap-4 mt-6">
        {["Card A", "Card B", "Card C"].map((card) => (
          <div
            key={card}
            className="w-32 h-48 bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-600"
          >
            {card}
          </div>
        ))}
      </div>
    </main>
  );
}
