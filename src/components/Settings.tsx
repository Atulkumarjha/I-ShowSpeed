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
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex flex-col gap-6 items-center justify-center">
        {/* Mode Toggle */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Choose test mode:</p>
          <div className="flex gap-4">
            <span
              className={`font-medium ${
                selectedTime !== null ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              Time Limit
            </span>
            <span className="text-gray-500">or</span>
            <span
              className={`font-medium ${
                selectedWordCount !== null ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              Word Limit
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* Time Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 text-center">
              Time (seconds)
            </label>
            <div className="flex gap-2">
              {times.map((time) => (
                <button
                  key={time.id}
                  onClick={() => onTimeChange(time.duration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedTime === time.duration
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Word Count Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 text-center">Words</label>
            <div className="flex gap-2">
              {wordCounts.map((wc) => (
                <button
                  key={wc.count}
                  onClick={() => onWordCountChange(wc.count)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedWordCount === wc.count
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
