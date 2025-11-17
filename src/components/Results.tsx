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
    <div className="w-full max-w-2xl mx-auto p-8 bg-gray-800 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">
        Test Complete!
      </h2>

      {/* User Stats Section */}
      {user && userStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 text-center">
            Your Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-white">
                {userStats.totalTests}
              </div>
              <div className="text-gray-400">Total Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {userStats.averageWpm}
              </div>
              <div className="text-gray-400">Average WPM</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {userStats.bestWpm}
              </div>
              <div className="text-gray-400">Best WPM</div>
            </div>
          </div>
          {saved && (
            <div className="mt-3 text-center text-sm text-green-400">
              ✓ Result saved successfully
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* WPM */}
        <div className="bg-gray-700 p-6 rounded-lg text-center">
          <div className="text-5xl font-bold text-yellow-400 mb-2">{wpm}</div>
          <div className="text-gray-400 text-sm uppercase">
            Words Per Minute
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-gray-700 p-6 rounded-lg text-center">
          <div className="text-5xl font-bold text-green-400 mb-2">
            {accuracy.toFixed(1)}%
          </div>
          <div className="text-gray-400 text-sm uppercase">Accuracy</div>
        </div>

        {/* Correct Characters */}
        <div className="bg-gray-700 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {correctChars}
          </div>
          <div className="text-gray-400 text-sm uppercase">
            Correct Characters
          </div>
        </div>

        {/* Incorrect Characters */}
        <div className="bg-gray-700 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-red-400 mb-2">
            {incorrectChars}
          </div>
          <div className="text-gray-400 text-sm uppercase">
            Incorrect Characters
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors text-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
