import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { AnatomicalRegion } from '../types/anatomy';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: AnatomicalRegion;
  onResetCurrentRegion: () => void;
  onResetAll: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  currentRegion,
  onResetCurrentRegion,
  onResetAll,
}) => {
  if (!isOpen) return null;

  const regionNames: Record<AnatomicalRegion, string> = {
    todos: 'Todos os Módulos',
    mmii: 'Membros Inferiores (MMII)',
    cranio: 'Crânio e Face',
    torax: 'Tórax e Coluna',
    mmss: 'Membros Superiores (MMSS)',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gerenciar Histórico</h3>
              <p className="text-xs text-slate-400">Escolha o nível de reinício desejado</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Você pode reiniciar apenas o progresso do módulo selecionado para praticar do zero, ou apagar todos os dados salvos no navegador.
        </p>

        <div className="flex flex-col gap-2.5">
          {currentRegion !== 'todos' && (
            <button
              onClick={() => {
                onResetCurrentRegion();
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
            >
              <span>Reiniciar Apenas: <strong>{regionNames[currentRegion]}</strong></span>
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <button
            onClick={() => {
              onResetAll();
              onClose();
            }}
            className="w-full p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <span>Apagar TODO o Histórico de Todos os Módulos</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
