"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  _id: string;
  name: string;
  bestWpm: number;
  bestAccuracy: number;
  totalTests: number;
  averageWpm: number;
}

interface LeaderboardProps {
  mode?: "time" | "words";
  limit?: number;
}

export default function Leaderboard({
  mode = "time",
  limit = 15,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"time" | "words">(mode);

  useEffect(() => {
    let mounted = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/leaderboard?mode=${selectedMode}&limit=${limit}`
        );
        const data = await response.json();
        if (mounted) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch {
        if (mounted) {
          setLeaderboard([]);
        }
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      mounted = false;
    };
  }, [selectedMode, limit]);

  return (
    <div className="w-full p-8 bg-gray-800 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-yellow-400 flex items-center gap-3">
          🏆 Leaderboard
        </h2>

        {/* Mode Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedMode("time")}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              selectedMode === "time"
                ? "bg-yellow-400 text-black shadow-lg scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ⏱️ Time Mode
          </button>
          <button
            onClick={() => setSelectedMode("words")}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              selectedMode === "words"
                ? "bg-yellow-400 text-black shadow-lg scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            📝 Words Mode
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          <div className="animate-pulse">Loading leaderboard...</div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-lg">
          <div className="text-4xl mb-4">🎯</div>
          <p>No results yet. Be the first to complete a test!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Best WPM
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Avg WPM
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Best Accuracy
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Tests
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry._id}
                  className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                    index < 3 ? "bg-gray-750/50" : ""
                  }`}
                >
                  <td className="px-6 py-5 text-left">
                    <span
                      className={`font-bold text-xl ${
                        index === 0
                          ? "text-yellow-400"
                          : index === 1
                          ? "text-gray-300"
                          : index === 2
                          ? "text-orange-400"
                          : "text-gray-500"
                      }`}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-left font-semibold text-white text-lg">
                    {entry.name}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-yellow-400 font-bold text-2xl">
                      {entry.bestWpm}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-300 text-lg font-medium">
                    {Math.round(entry.averageWpm)}
                  </td>
                  <td className="px-6 py-5 text-center text-green-400 text-lg font-medium">
                    {entry.bestAccuracy.toFixed(1)}%
                  </td>
                  <td className="px-6 py-5 text-center text-gray-400 text-lg">
                    {entry.totalTests}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
