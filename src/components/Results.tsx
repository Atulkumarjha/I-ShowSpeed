"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ResultsProps {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  onRestart: () => void;
  mode: "time" | "words";
  limit: number;
}

export default function Results({
  wpm,
  accuracy,
  correctChars,
  incorrectChars,
  onRestart,
  mode,
  limit,
}: ResultsProps) {
  const { user, token } = useAuth();
  const [saved, setSaved] = useState(false);
  const [userStats, setUserStats] = useState<{
    totalTests: number;
    averageWpm: number;
    bestWpm: number;
  } | null>(null);

  // Save results to database
  useEffect(() => {
    if (user && token && !saved) {
      fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wpm,
          accuracy,
          correctChars,
          incorrectChars,
          mode,
          limit,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSaved(true);
            // Fetch user stats
            return fetch("/api/results", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        })
        .then((res) => res?.json())
        .then((data) => {
          if (data?.stats) {
            setUserStats(data.stats);
          }
        })
        .catch(() => {
          // Silently fail if save fails
        });
    }
  }, [user, token, saved, wpm, accuracy, correctChars, incorrectChars, mode, limit]);
  return (
    <div className="w-full p-8 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-4xl font-bold text-center mb-8 text-yellow-400">
        🎉 Test Complete!
      </h2>

      {/* User Stats Section */}
      {user && userStats && (
        <div className="mb-8 p-6 bg-linear-to-r from-gray-700 to-gray-750 rounded-lg border border-gray-600">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
            📊 Your Statistics
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-white mb-1">
                {userStats.totalTests}
              </div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">Total Tests</div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {userStats.averageWpm}
              </div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">Average WPM</div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {userStats.bestWpm}
              </div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">Best WPM</div>
            </div>
          </div>
          {saved && (
            <div className="mt-4 text-center text-sm text-green-400 font-medium">
              ✓ Result saved successfully
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* WPM */}
        <div className="bg-linear-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 p-8 rounded-lg text-center">
          <div className="text-6xl font-bold text-yellow-400 mb-3">{wpm}</div>
          <div className="text-gray-300 text-sm uppercase tracking-wider font-semibold">
            Words Per Minute
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-linear-to-br from-green-500/10 to-green-600/10 border border-green-500/30 p-8 rounded-lg text-center">
          <div className="text-6xl font-bold text-green-400 mb-3">
            {accuracy.toFixed(1)}%
          </div>
          <div className="text-gray-300 text-sm uppercase tracking-wider font-semibold">Accuracy</div>
        </div>

        {/* Correct Characters */}
        <div className="bg-gray-700/50 border border-gray-600 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">
            {correctChars}
          </div>
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Correct Characters
          </div>
        </div>

        {/* Incorrect Characters */}
        <div className="bg-gray-700/50 border border-gray-600 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold text-red-400 mb-2">
            {incorrectChars}
          </div>
          <div className="text-gray-400 text-xs uppercase tracking-wider">
            Incorrect Characters
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="px-10 py-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-all hover:scale-105 text-lg shadow-lg"
        >
          ↻ Try Again
        </button>
      </div>
    </div>
  );
}
