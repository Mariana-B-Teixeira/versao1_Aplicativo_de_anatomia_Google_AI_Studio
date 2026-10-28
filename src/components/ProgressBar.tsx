import React from 'react';

interface ProgressBarProps {
  currentIndex: number;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  boneGroup: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  totalCards,
  correctCount,
  incorrectCount,
  boneGroup,
}) => {
  const currentNumber = totalCards > 0 ? currentIndex + 1 : 0;
  const progressPercent = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="w-full bg-slate-900/40 border-b border-slate-800/40 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {/* Card Counter & Bone context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Progresso:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 font-bold text-sm">
              Card {currentNumber} de {totalCards}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-slate-800 hidden sm:block"></div>

          <span className="text-xs font-semibold text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
            {boneGroup}
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full sm:w-64 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 w-9 text-right font-semibold">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
};
