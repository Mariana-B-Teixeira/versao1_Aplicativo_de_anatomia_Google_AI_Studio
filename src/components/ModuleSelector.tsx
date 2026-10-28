import React from 'react';
import { AnatomicalRegion } from '../types/anatomy';
import { Shuffle, Sparkles, Filter, CheckCircle2, XCircle, Clock, Star } from 'lucide-react';

interface ModuleSelectorProps {
  currentRegion: AnatomicalRegion;
  onSelectRegion: (region: AnatomicalRegion) => void;
  statusFilter: 'all' | 'pending' | 'incorrect' | 'starred';
  onSelectStatusFilter: (filter: 'all' | 'pending' | 'incorrect' | 'starred') => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  regionCounts: Record<AnatomicalRegion, number>;
  statusCounts: {
    total: number;
    pending: number;
    incorrect: number;
    starred: number;
  };
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  currentRegion,
  onSelectRegion,
  statusFilter,
  onSelectStatusFilter,
  isShuffled,
  onToggleShuffle,
  regionCounts,
  statusCounts,
}) => {
  const regions: { id: AnatomicalRegion; label: string; short: string; badge: string }[] = [
    { id: 'todos', label: 'Esqueleto Completo', short: 'Geral', badge: `${regionCounts.todos}` },
    { id: 'mmii', label: 'Membros Inferiores', short: 'MMII', badge: `${regionCounts.mmii}` },
    { id: 'cranio', label: 'Crânio e Face', short: 'Crânio', badge: `${regionCounts.cranio}` },
    { id: 'torax', label: 'Tórax e Coluna', short: 'Tórax/Coluna', badge: `${regionCounts.torax}` },
    { id: 'mmss', label: 'Membros Superiores', short: 'MMSS', badge: `${regionCounts.mmss}` },
  ];

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800/80 p-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Region Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {regions.map((reg) => {
            const isActive = currentRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => onSelectRegion(reg.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{reg.short}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {reg.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter sub-bar & Shuffle */}
        <div className="flex items-center justify-between md:justify-end gap-2 text-xs">
          {/* Status Filters */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Todos os cards do módulo"
            >
              Todos ({statusCounts.total})
            </button>

            <button
              onClick={() => onSelectStatusFilter('pending')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-950/80 text-amber-300 font-semibold border border-amber-800/50'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Cards ainda não respondidos"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Pendentes ({statusCounts.pending})</span>
            </button>

            <button
              onClick={() => onSelectStatusFilter('incorrect')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'incorrect'
                  ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/50'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
              title="Erros para reforçar e revisar"
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>Erros ({statusCounts.incorrect})</span>
            </button>

            <button
              onClick={() => onSelectStatusFilter('starred')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'starred'
                  ? 'bg-yellow-950/80 text-yellow-300 font-semibold border border-yellow-800/50'
                  : 'text-slate-400 hover:text-yellow-300'
              }`}
              title="Cards com estrela / marcados"
            >
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span>({statusCounts.starred})</span>
            </button>
          </div>

          {/* Shuffle Toggle */}
          <button
            onClick={onToggleShuffle}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isShuffled
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isShuffled ? 'Modo Aleatório Ativado' : 'Ativar Modo Aleatório (Embaralhar)'}
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffled ? 'text-cyan-400 animate-spin-slow' : ''}`} />
            <span className="hidden sm:inline">Aleatório</span>
          </button>
        </div>
      </div>
    </div>
  );
};
