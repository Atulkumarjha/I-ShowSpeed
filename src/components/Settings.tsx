"use client";

interface Time {
  id: number;
  duration: number;
  label: string;
}

interface SettingsProps {
  selectedTime: number | null;
  selectedWordCount: number | null;
  onTimeChange: (duration: number) => void;
  onWordCountChange: (count: number) => void;
  times: Time[];
}

export default function Settings({
  selectedTime,
  selectedWordCount,
  onTimeChange,
  onWordCountChange,
  times,
}: SettingsProps) {
  const wordCounts = [
    { count: 50, label: "50" },
    { count: 100, label: "100" },
    { count: 150, label: "150" },
    { count: 200, label: "200" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {/* Mode Toggle */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Choose test mode:</p>
          <div className="flex gap-4 items-center justify-center">
            <span
              className={`font-medium text-lg ${
                selectedTime !== null ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              Time Limit
            </span>
            <span className="text-gray-500 text-sm">or</span>
            <span
              className={`font-medium text-lg ${
                selectedWordCount !== null ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              Word Limit
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Time Selection */}
          <div className="flex flex-col gap-3 items-center">
            <label className="text-sm text-gray-400 font-medium">
              Time (seconds)
            </label>
            <div className="flex gap-3">
              {times.map((time) => (
                <button
                  key={time.id}
                  onClick={() => onTimeChange(time.duration)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedTime === time.duration
                      ? "bg-yellow-400 text-gray-900 scale-105 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-20 bg-gray-700"></div>

          {/* Word Count Selection */}
          <div className="flex flex-col gap-3 items-center">
            <label className="text-sm text-gray-400 font-medium">Words</label>
            <div className="flex gap-3">
              {wordCounts.map((wc) => (
                <button
                  key={wc.count}
                  onClick={() => onWordCountChange(wc.count)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedWordCount === wc.count
                      ? "bg-yellow-400 text-gray-900 scale-105 shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                  }`}
                >
                  {wc.count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
