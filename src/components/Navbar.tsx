import React from 'react';
import { Activity, RotateCcw, Volume2, VolumeX, BarChart3, Bookmark } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface NavbarProps {
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  starredCount: number;
  onOpenStats: () => void;
  onOpenReset: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCards,
  correctCount,
  incorrectCount,
  starredCount,
  onOpenStats,
  onOpenReset,
  soundMuted,
  onToggleSound,
}) => {
  const answeredTotal = correctCount + incorrectCount;
  const accuracy = answeredTotal > 0 ? Math.round((correctCount / answeredTotal) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-900/40 text-white font-bold ring-1 ring-cyan-400/30">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                StudyFlow
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                Anatomy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Osteologia & Acidentes Ósseos • Recordação Ativa
            </p>
          </div>
        </div>

        {/* Live Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold" title="Acertos">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              {correctCount}
            </div>
            <div className="w-[1px] h-3 bg-slate-800"></div>
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold" title="Erros">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
              {incorrectCount}
            </div>
            <div className="w-[1px] h-3 bg-slate-800"></div>
            <div className="text-slate-300 font-medium" title="Taxa de acerto">
              {accuracy}% precisão
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border text-sm transition-all flex items-center justify-center ${
                soundMuted
                  ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  : 'bg-cyan-950/50 border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60'
              }`}
              title={soundMuted ? 'Ativar efeitos sonoros' : 'Silenciar áudio'}
              aria-label="Som"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenStats}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              title="Ver estatísticas detalhadas"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Desempenho</span>
            </button>

            <button
              onClick={onOpenReset}
              className="p-2 rounded-lg bg-slate-800/70 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800/80 text-slate-400 hover:text-rose-300 transition-all text-xs"
              title="Reiniciar ou resetar progresso"
              aria-label="Resetar progresso"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
