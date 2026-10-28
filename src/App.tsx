import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ANATOMY_CARDS } from './data/ossos';
import { AnatomyCard, AnatomicalRegion, UserProgress, CardAttempt } from './types/anatomy';
import { Navbar } from './components/Navbar';
import { ModuleSelector } from './components/ModuleSelector';
import { ProgressBar } from './components/ProgressBar';
import { FlashcardViewer } from './components/FlashcardViewer';
import { StatsModal } from './components/StatsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { soundManager } from './utils/soundEffects';
import { Award, RotateCcw, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'studyflow_anatomy_v2';

export default function App() {
  // Estado de progresso persistente no localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler localStorage', e);
    }
    return {
      attempts: {},
      starred: [],
      lastCardIndexByRegion: {},
    };
  });

  // Salva no localStorage sempre que o progresso mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }, [progress]);

  // Região anatômica ativa
  const [currentRegion, setCurrentRegion] = useState<AnatomicalRegion>(() => {
    try {
      const saved = localStorage.getItem('studyflow_current_region');
      if (saved) return saved as AnatomicalRegion;
    } catch {}
    return 'todos';
  });

  // Filtro de status dos cards
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'incorrect' | 'starred'>('all');

  // Modo aleatório / embaralhado
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  // Índice do card atual na lista filtrada (garante unicidade sem repetição)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Modais
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => soundManager.getIsMuted());

  // Salva região selecionada
  const handleSelectRegion = (region: AnatomicalRegion) => {
    setCurrentRegion(region);
    try {
      localStorage.setItem('studyflow_current_region', region);
    } catch {}
    setCurrentIndex(0);
  };

  // Toggle do som
  const handleToggleSound = () => {
    const newMuted = soundManager.toggleMute();
    setSoundMuted(newMuted);
  };

  // Garante que a lista base nunca tenha cards repetidos (deduplicação por ID e alvo)
  const uniqueMasterCards = useMemo(() => {
    const seenIds = new Set<string>();
    const seenTargets = new Set<string>();
    const uniqueList: AnatomyCard[] = [];

    for (const card of ANATOMY_CARDS) {
      const targetKey = `${card.region}-${card.targetName.toLowerCase()}`;
      if (!seenIds.has(card.id) && !seenTargets.has(targetKey)) {
        seenIds.add(card.id);
        seenTargets.add(targetKey);
        uniqueList.push(card);
      }
    }
    return uniqueList;
  }, []);

  // Contagem por região para os badges
  const regionCounts = useMemo(() => {
    return {
      todos: uniqueMasterCards.length,
      mmii: uniqueMasterCards.filter((c) => c.region === 'mmii').length,
      cranio: uniqueMasterCards.filter((c) => c.region === 'cranio').length,
      torax: uniqueMasterCards.filter((c) => c.region === 'torax').length,
      mmss: uniqueMasterCards.filter((c) => c.region === 'mmss').length,
    };
  }, [uniqueMasterCards]);

  // Filtragem dos cards pela região e subfiltro sem nenhuma repetição
  const filteredCards = useMemo(() => {
    let list = uniqueMasterCards;

    // Filtra por região
    if (currentRegion !== 'todos') {
      list = list.filter((c) => c.region === currentRegion);
    }

    // Filtra por status
    if (statusFilter === 'pending') {
      list = list.filter((c) => !progress.attempts[c.id]);
    } else if (statusFilter === 'incorrect') {
      list = list.filter((c) => {
        const att = progress.attempts[c.id];
        return att && !att.isCorrect;
      });
    } else if (statusFilter === 'starred') {
      list = list.filter((c) => progress.starred.includes(c.id));
    }

    // Embaralha se solicitado (ordem estável na sessão)
    if (isShuffled) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    return list;
  }, [uniqueMasterCards, currentRegion, statusFilter, isShuffled, progress]);

  // Contagem de status para os botões de filtro
  const statusCounts = useMemo(() => {
    const listForRegion = currentRegion === 'todos'
      ? uniqueMasterCards
      : uniqueMasterCards.filter((c) => c.region === currentRegion);

    let pending = 0;
    let incorrect = 0;
    let starred = 0;

    listForRegion.forEach((c) => {
      const att = progress.attempts[c.id];
      if (!att) {
        pending++;
      } else if (!att.isCorrect) {
        incorrect++;
      }
      if (progress.starred.includes(c.id)) {
        starred++;
      }
    });

    return {
      total: listForRegion.length,
      pending,
      incorrect,
      starred,
    };
  }, [uniqueMasterCards, currentRegion, progress]);

  // Ajusta o índice se a lista filtrada encolher
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(Math.max(0, filteredCards.length - 1));
    }
  }, [filteredCards.length, currentIndex]);

  // Submissão de tentativa em um card
  const handleAttempt = useCallback((cardId: string, answer: string, isCorrect: boolean) => {
    setProgress((prev) => {
      const newAttempts: Record<string, CardAttempt> = {
        ...prev.attempts,
        [cardId]: {
          userAnswer: answer,
          isCorrect,
          timestamp: Date.now(),
        },
      };
      return {
        ...prev,
        attempts: newAttempts,
      };
    });
  }, []);

  // Forçar acerto (override didático do aluno)
  const handleOverrideCorrect = useCallback((cardId: string) => {
    setProgress((prev) => {
      const current = prev.attempts[cardId];
      return {
        ...prev,
        attempts: {
          ...prev.attempts,
          [cardId]: {
            userAnswer: current ? current.userAnswer : 'Validado pelo Aluno',
            isCorrect: true,
            timestamp: Date.now(),
          },
        },
      };
    });
  }, []);

  // Marcar/Desmarcar estrela
  const handleToggleStar = useCallback((cardId: string) => {
    setProgress((prev) => {
      const exists = prev.starred.includes(cardId);
      const newStarred = exists
        ? prev.starred.filter((id) => id !== cardId)
        : [...prev.starred, cardId];
      return {
        ...prev,
        starred: newStarred,
      };
    });
  }, []);

  // Avançar / Voltar card (sem repetição)
  const handleNextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : prev));
  }, [filteredCards.length]);

  const handlePrevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  // Resetar progresso
  const handleResetCurrentRegion = () => {
    const cardsToReset = uniqueMasterCards.filter(
      (c) => currentRegion === 'todos' || c.region === currentRegion
    ).map((c) => c.id);

    setProgress((prev) => {
      const newAttempts = { ...prev.attempts };
      cardsToReset.forEach((id) => delete newAttempts[id]);
      return {
        ...prev,
        attempts: newAttempts,
      };
    });
    setCurrentIndex(0);
  };

  const handleResetAll = () => {
    setProgress({
      attempts: {},
      starred: [],
      lastCardIndexByRegion: {},
    });
    setCurrentIndex(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Contadores globais
  const globalStats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    Object.values(progress.attempts).forEach((att) => {
      if (att.isCorrect) correct++;
      else incorrect++;
    });
    return {
      correct,
      incorrect,
      starred: progress.starred.length,
    };
  }, [progress]);

  const currentCard = filteredCards[currentIndex];

  // Verifica se todos os cards da seleção foram respondidos
  const isAllAnsweredInCurrentView = useMemo(() => {
    if (filteredCards.length === 0) return false;
    return filteredCards.every((c) => !!progress.attempts[c.id]);
  }, [filteredCards, progress.attempts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        totalCards={uniqueMasterCards.length}
        correctCount={globalStats.correct}
        incorrectCount={globalStats.incorrect}
        starredCount={globalStats.starred}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenReset={() => setIsResetOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Module Selector & Subfilters Bar */}
      <ModuleSelector
        currentRegion={currentRegion}
        onSelectRegion={handleSelectRegion}
        statusFilter={statusFilter}
        onSelectStatusFilter={(filter) => {
          setStatusFilter(filter);
          setCurrentIndex(0);
        }}
        isShuffled={isShuffled}
        onToggleShuffle={() => setIsShuffled((prev) => !prev)}
        regionCounts={regionCounts}
        statusCounts={statusCounts}
      />

      {/* Main Flashcard Container */}
      <main className="flex-1 flex flex-col items-center justify-start pb-12">
        {filteredCards.length > 0 && currentCard ? (
          <>
            {/* Progress Bar (Card X de Y sem repetições) */}
            <ProgressBar
              currentIndex={currentIndex}
              totalCards={filteredCards.length}
              correctCount={globalStats.correct}
              incorrectCount={globalStats.incorrect}
              boneGroup={currentCard.boneGroup}
            />

            {/* Core Flashcard Interactive Viewer */}
            <FlashcardViewer
              key={currentCard.id}
              card={currentCard}
              currentIndex={currentIndex}
              totalCards={filteredCards.length}
              existingAttempt={progress.attempts[currentCard.id]}
              isStarred={progress.starred.includes(currentCard.id)}
              onToggleStar={handleToggleStar}
              onSubmitAttempt={handleAttempt}
              onNextCard={handleNextCard}
              onPrevCard={handlePrevCard}
              onOverrideCorrect={handleOverrideCorrect}
            />
          </>
        ) : (
          /* Empty / Completed State */
          <div className="max-w-md mx-auto my-auto p-8 text-center flex flex-col items-center justify-center gap-4 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl mt-16 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950">
              <Award className="w-8 h-8 text-cyan-300" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-bold text-white">
                {statusFilter === 'incorrect'
                  ? 'Nenhum erro pendente!'
                  : statusFilter === 'pending'
                  ? 'Módulo Concluído com Sucesso!'
                  : statusFilter === 'starred'
                  ? 'Nenhum card com estrela'
                  : 'Parabéns! Todos os cards foram estudados.'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {statusFilter === 'incorrect'
                  ? 'Você dominou todas as estruturas anatômicas e não possui acidentes ósseos pendentes de revisão.'
                  : statusFilter === 'pending'
                  ? 'Você respondeu a todos os flashcards únicos deste módulo sem nenhuma repetição!'
                  : statusFilter === 'starred'
                  ? 'Marque itens desafiadores clicando na estrela para criar um banco de revisão rápida.'
                  : 'Você concluiu o ciclo deste módulo sem repetições.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 w-full">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCurrentIndex(0);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-950"
              >
                Ver Todos os Cards ({regionCounts[currentRegion]})
              </button>

              <button
                onClick={handleResetCurrentRegion}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Módulo</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Performance Summary Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        cards={uniqueMasterCards}
        progress={progress}
        onFilterIncorrect={() => {
          setStatusFilter('incorrect');
          setCurrentIndex(0);
        }}
        onResetProgress={handleResetAll}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        currentRegion={currentRegion}
        onResetCurrentRegion={handleResetCurrentRegion}
        onResetAll={handleResetAll}
      />
    </div>
  );
}
