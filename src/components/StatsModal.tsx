import React from 'react';
import { AnatomyCard, UserProgress } from '../types/anatomy';
import { X, Trophy, CheckCircle, XCircle, Clock, Star, ArrowRight, RotateCcw } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: AnatomyCard[];
  progress: UserProgress;
  onFilterIncorrect: () => void;
  onResetProgress: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  cards,
  progress,
  onFilterIncorrect,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const totalCards = cards.length;
  let correctCount = 0;
  let incorrectCount = 0;
  const incorrectCards: AnatomyCard[] = [];

  cards.forEach((c) => {
    const attempt = progress.attempts[c.id];
    if (attempt) {
      if (attempt.isCorrect) correctCount++;
      else {
        incorrectCount++;
        incorrectCards.push(c);
      }
    }
  });

  const answeredCount = correctCount + incorrectCount;
  const pendingCount = totalCards - answeredCount;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Breakdown por região
  const regions: { id: 'mmii' | 'cranio' | 'torax' | 'mmss'; label: string }[] = [
    { id: 'mmii', label: 'Membros Inferiores (MMII)' },
    { id: 'cranio', label: 'Crânio e Face' },
    { id: 'torax', label: 'Tórax e Coluna' },
    { id: 'mmss', label: 'Membros Superiores (MMSS)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col gap-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center text-slate-950">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Painel de Desempenho</h2>
              <p className="text-xs text-slate-400">Progresso global e taxa de retenção anatômica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Precisão</span>
            <span className="text-2xl font-black text-cyan-400">{accuracy}%</span>
            <span className="text-[10px] text-slate-500">{correctCount} acertos de {answeredCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase">Dominados</span>
            <span className="text-2xl font-black text-emerald-400">{correctCount}</span>
            <span className="text-[10px] text-slate-500">{Math.round((correctCount / totalCards) * 100)}% do curso</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-rose-400 uppercase">Para Revisar</span>
            <span className="text-2xl font-black text-rose-400">{incorrectCount}</span>
            <span className="text-[10px] text-slate-500">Erros a reforçar</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-amber-400 uppercase">Pendentes</span>
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
            <span className="text-[10px] text-slate-500">Ainda não vistos</span>
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Aproveitamento por Módulo
          </h3>
          <div className="flex flex-col gap-2.5">
            {regions.map((reg) => {
              const regionCards = cards.filter((c) => c.region === reg.id);
              const regTotal = regionCards.length;
              let regCorrect = 0;
              let regAnswered = 0;

              regionCards.forEach((c) => {
                const att = progress.attempts[c.id];
                if (att) {
                  regAnswered++;
                  if (att.isCorrect) regCorrect++;
                }
              });

              const regPercent = regTotal > 0 ? Math.round((regCorrect / regTotal) * 100) : 0;

              return (
                <div key={reg.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-200">{reg.label}</span>
                    <span className="font-mono text-cyan-400">{regCorrect}/{regTotal} ({regPercent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${regPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action: Revisar Erros */}
        {incorrectCards.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-300">
                Você tem {incorrectCards.length} {incorrectCards.length === 1 ? 'card' : 'cards'} para reforçar
              </h4>
              <p className="text-xs text-rose-400/90">
                Foque nos acidentes ósseos que você errou para fixar na memória de longo prazo.
              </p>
            </div>
            <button
              onClick={() => {
                onFilterIncorrect();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-950 whitespace-nowrap"
            >
              <span>Revisar Erros Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => {
              if (window.confirm('Deseja realmente limpar todo o histórico de tentativas?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="text-slate-500 hover:text-rose-400 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Histórico Completo</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
          >
            Continuar Estudando
          </button>
        </div>
      </div>
    </div>
  );
};
