const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { from: "#10b981", to: "#059669" }; // Green
    if (score >= 60) return { from: "#f59e0b", to: "#d97706" }; // Yellow
    return { from: "#ef4444", to: "#dc2626" }; // Red
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative w-[100px] h-[100px]">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Partial circle with gradient */}
        <defs>
          <linearGradient id={`grad-${score}`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke={`url(#grad-${score})`}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="drop-shadow-lg"
        />
      </svg>

      {/* Score and issues */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-lg text-gray-800 drop-shadow-lg">{`${score}`}</span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
