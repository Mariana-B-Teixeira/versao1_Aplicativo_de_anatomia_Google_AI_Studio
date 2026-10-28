import React, { useState, useEffect, useRef } from 'react';
import { AnatomyCard, CardAttempt, MatchResult } from '../types/anatomy';
import { validateAnatomyAnswer } from '../utils/anatomyMatcher';
import { soundManager } from '../utils/soundEffects';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Star,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Stethoscope,
  Lightbulb,
  Check,
  Sparkles,
  Target,
  Crosshair
} from 'lucide-react';

interface FlashcardViewerProps {
  card: AnatomyCard;
  currentIndex: number;
  totalCards: number;
  existingAttempt?: CardAttempt;
  isStarred: boolean;
  onToggleStar: (cardId: string) => void;
  onSubmitAttempt: (cardId: string, answer: string, isCorrect: boolean) => void;
  onNextCard: () => void;
  onPrevCard: () => void;
  onOverrideCorrect: (cardId: string) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  card,
  currentIndex,
  totalCards,
  existingAttempt,
  isStarred,
  onToggleStar,
  onSubmitAttempt,
  onNextCard,
  onPrevCard,
  onOverrideCorrect,
}) => {
  const [userInput, setUserInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);
  const [containerAspect, setContainerAspect] = useState<string>(
    card.imageWidth && card.imageHeight ? `${card.imageWidth} / ${card.imageHeight}` : 'auto'
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza estado quando o card muda
  useEffect(() => {
    setShowHint(false);
    setZoomLevel(1);
    setIsZoomed(false);
    setContainerAspect(
      card.imageWidth && card.imageHeight ? `${card.imageWidth} / ${card.imageHeight}` : 'auto'
    );

    if (existingAttempt) {
      setUserInput(existingAttempt.userAnswer);
      setHasSubmitted(true);
      setMatchResult({
        isMatch: existingAttempt.isCorrect,
        score: existingAttempt.isCorrect ? 1 : 0,
        matchedWith: existingAttempt.isCorrect ? card.targetName : undefined,
      });
    } else {
      setUserInput('');
      setHasSubmitted(false);
      setMatchResult(null);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [card.id, existingAttempt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (hasSubmitted) {
      onNextCard();
      return;
    }

    const trimmed = userInput.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    const result = validateAnatomyAnswer(trimmed, card.targetName, card.synonyms);
    setMatchResult(result);
    setHasSubmitted(true);

    if (result.isMatch) {
      soundManager.playSuccess();
    } else {
      soundManager.playError();
    }

    onSubmitAttempt(card.id, trimmed, result.isMatch);
  };

  const handleRevealAnswer = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    setMatchResult({ isMatch: false, score: 0 });
    soundManager.playError();
    onSubmitAttempt(card.id, 'Não soube / Revelou', false);
  };

  const handleRetryCard = () => {
    setUserInput('');
    setHasSubmitted(false);
    setMatchResult(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevCard();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (hasSubmitted) {
          onNextCard();
        } else {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSubmitted, onNextCard, onPrevCard]);

  // Safe, intelligent arrow direction calculation ensuring the pointer never spills outside the image
  const effectiveArrowDir: 'top' | 'bottom' | 'left' | 'right' = (() => {
    // If landmark is near top edge (y <= 28%), position arrow pointing up from below (label below landmark)
    if (card.indicator.y <= 28) return 'top';
    // If landmark is near bottom edge (y >= 72%), position arrow pointing down from above (label above landmark)
    if (card.indicator.y >= 72) return 'bottom';
    // If landmark is near left edge (x <= 20%), position arrow pointing left from right (label to right)
    if (card.indicator.x <= 20) return 'left';
    // If landmark is near right edge (x >= 80%), position arrow pointing right from left (label to left)
    if (card.indicator.x >= 80) return 'right';
    const dir = card.indicator.arrowDirection;
    if (dir === 'top' || dir === 'bottom' || dir === 'left' || dir === 'right') {
      return dir;
    }
    return 'bottom';
  })();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 py-3 px-3 sm:px-6">
      {/* Context Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-xs font-bold uppercase tracking-wider">
            {card.boneGroup}
          </span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-slate-200 text-xs sm:text-sm font-semibold truncate max-w-[280px] sm:max-w-md">
            {card.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Star */}
          <button
            onClick={() => onToggleStar(card.id)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              isStarred
                ? 'bg-yellow-950/80 border-yellow-700/80 text-yellow-300 shadow-sm shadow-yellow-900/40'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-yellow-300 hover:bg-slate-800'
            }`}
            title={isStarred ? 'Remover dos favoritos' : 'Marcar para revisão'}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            <span className="hidden sm:inline">{isStarred ? 'Favorito' : 'Favoritar'}</span>
          </button>

          {/* Zoom Toggle */}
          <button
            onClick={() => {
              if (zoomLevel === 1) {
                setZoomLevel(1.6);
                setIsZoomed(true);
              } else {
                setZoomLevel(1);
                setIsZoomed(false);
              }
            }}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              isZoomed
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
            }`}
            title={isZoomed ? 'Redefinir Zoom (100%)' : 'Ampliar Imagem'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isZoomed ? '160%' : 'Lupa'}</span>
          </button>

          {/* Fullscreen Modal Toggle */}
          <button
            onClick={() => setIsFullscreenModal(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 text-xs transition-all"
            title="Expandir Imagem em Tela Cheia"
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Image Box: Exibição inteira e limpa do osso com aspecto travado e mira cirúrgica */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex items-center justify-center min-h-[380px] sm:min-h-[480px] max-h-[580px] p-4 select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

        {/* Container relativo matematicamente idêntico à caixa delimitadora da imagem */}
        <div
          className="relative block max-w-full max-h-[460px] transition-transform duration-200"
          style={{
            aspectRatio: containerAspect,
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${card.indicator.x}% ${card.indicator.y}%`,
          }}
        >
          {/* Imagem do Osso Isolado em Exibição Inteira sem distorções, com cores 100% originais */}
          <img
            src={card.image}
            alt={card.title}
            className="block w-full h-full object-contain rounded-xl shadow-2xl pointer-events-none select-none mx-auto"
            loading="eager"
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) {
                setContainerAspect(`${naturalWidth} / ${naturalHeight}`);
              }
            }}
          />

          {/* MIRA CIRÚRGICA TRAVADA EXATAMENTE SOBRE O ACIDENTE ÓSSEO */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: `${card.indicator.x}%`,
              top: `${card.indicator.y}%`,
            }}
          >
            {/* O Ponto (0, 0) deste bloco fica milimetricamente no centro da coordenada */}
            <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-0 h-0">
              {/* 1. Pulso de Foco Circular */}
              <span
                className={`absolute w-10 h-10 rounded-full pointer-events-none animate-ping ${
                  hasSubmitted
                    ? matchResult?.isMatch
                      ? 'bg-emerald-500/40'
                      : 'bg-rose-500/40'
                    : 'bg-rose-500/35'
                }`}
              ></span>

              {/* 2. Anel de Mira Circular Exata */}
              <span
                className={`absolute w-6 h-6 rounded-full border-2 pointer-events-none ${
                  hasSubmitted
                    ? matchResult?.isMatch
                      ? 'border-emerald-400 bg-emerald-500/25'
                      : 'border-rose-400 bg-rose-500/25'
                    : 'border-rose-400 bg-rose-500/25 animate-pulse'
                }`}
              ></span>

              {/* 3. Retículo de Mira Cruzada (+) */}
              <div className="absolute w-6 h-[1.5px] bg-white pointer-events-none shadow-sm"></div>
              <div className="absolute h-6 w-[1.5px] bg-white pointer-events-none shadow-sm"></div>

              {/* 4. Ponto Central Milimétrico Cravado no Osso */}
              <span
                className={`relative w-2.5 h-2.5 rounded-full border border-white shadow-2xl pointer-events-none ${
                  hasSubmitted
                    ? matchResult?.isMatch
                      ? 'bg-emerald-500 shadow-emerald-500'
                      : 'bg-rose-600 shadow-rose-600'
                    : 'bg-rose-600 shadow-rose-600'
                }`}
              ></span>

              {/* 5. Seta Apontadora Cirúrgica com a Ponta Tocando Diretamente no Centro */}
              <div
                className={`absolute pointer-events-auto flex items-center gap-0.5 z-30 transition-all ${
                  effectiveArrowDir === 'bottom'
                    ? 'bottom-2 left-1/2 -translate-x-1/2 flex-col'
                    : effectiveArrowDir === 'top'
                    ? 'top-2 left-1/2 -translate-x-1/2 flex-col-reverse'
                    : effectiveArrowDir === 'right'
                    ? 'right-2 top-1/2 -translate-y-1/2 flex-row'
                    : 'left-2 top-1/2 -translate-y-1/2 flex-row-reverse'
                }`}
              >
                {/* Etiqueta Indicadora */}
                <div
                  className={`px-2 py-0.5 rounded-md font-black text-[10px] tracking-wider shadow-2xl border max-w-[200px] truncate text-center ${
                    hasSubmitted
                      ? matchResult?.isMatch
                        ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-950'
                        : 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-950'
                      : 'bg-rose-600 text-white border-rose-200 ring-2 ring-rose-950'
                  }`}
                >
                  {hasSubmitted ? (
                    <div className="flex items-center gap-1 justify-center truncate">
                      {matchResult?.isMatch ? <Check className="w-3 h-3 flex-shrink-0" /> : <XCircle className="w-3 h-3 flex-shrink-0" />}
                      <span className="truncate">{card.targetName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 justify-center truncate">
                      <Target className="w-3 h-3 text-white flex-shrink-0 animate-pulse" />
                      <span className="truncate">QUAL É ESTA ESTRUTURA?</span>
                    </div>
                  )}
                </div>

                {/* Ponta da Seta direcionada ao centro da mira com cor sincronizada */}
                <div
                  className={`w-0 h-0 border-solid ${
                    effectiveArrowDir === 'bottom'
                      ? 'border-x-[5px] border-x-transparent border-t-[7px]'
                      : effectiveArrowDir === 'top'
                      ? 'border-x-[5px] border-x-transparent border-b-[7px]'
                      : effectiveArrowDir === 'right'
                      ? 'border-y-[5px] border-y-transparent border-l-[7px]'
                      : 'border-y-[5px] border-y-transparent border-r-[7px]'
                  } ${
                    hasSubmitted && matchResult?.isMatch
                      ? effectiveArrowDir === 'bottom'
                        ? 'border-t-emerald-600'
                        : effectiveArrowDir === 'top'
                        ? 'border-b-emerald-600'
                        : effectiveArrowDir === 'right'
                        ? 'border-l-emerald-600'
                        : 'border-r-emerald-600'
                      : effectiveArrowDir === 'bottom'
                      ? 'border-t-rose-600'
                      : effectiveArrowDir === 'top'
                      ? 'border-b-rose-600'
                      : effectiveArrowDir === 'right'
                      ? 'border-l-rose-600'
                      : 'border-r-rose-600'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Orientation badge */}
        <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mira cravada no acidente ósseo</span>
        </div>
      </div>

      {/* Interactive Answer Input & Feedback Form */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
        {!hasSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Digite aqui o nome da estrutura ou acidente ósseo na mira..."
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-500 text-sm sm:text-base font-medium outline-none transition-all shadow-inner"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={hasSubmitted}
                />
                {userInput && (
                  <button
                    type="button"
                    onClick={() => setUserInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!userInput.trim()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950 active:scale-98"
              >
                <span>Confirmar Resposta</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-900 hidden sm:inline">
                  Enter ↵
                </span>
              </button>
            </div>

            {/* Helper actions: Dica e Pular */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold px-2 py-1 rounded-lg hover:bg-amber-950/30 transition-all"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Ocultar Dica' : 'Precisa de Dica? (Atalho H)'}</span>
              </button>

              <button
                type="button"
                onClick={handleRevealAnswer}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800 transition-all font-medium"
              >
                Não sei / Revelar Gabarito
              </button>
            </div>

            {/* Collapsible Hint Card */}
            {showHint && (
              <div className="mt-2 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-300 block mb-0.5">Dica Anatômica:</strong>
                  <span>{card.hint}</span>
                  <div className="mt-1 text-[11px] text-amber-400/80">
                    Começa com: <strong className="font-mono text-white text-xs">{card.targetName.charAt(0).toUpperCase()}</strong> • Contém {card.targetName.replace(/\s+/g, '').length} letras
                  </div>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* FEEDBACK DIDÁTICO DETALHADO (POSITIVO OU NEGATIVO) */
          <div className="flex flex-col gap-4 animate-fadeIn">
            {matchResult?.isMatch ? (
              /* FEEDBACK POSITIVO (VERDE) */
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/60 border-2 border-emerald-500/80 text-emerald-100 flex flex-col gap-3 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-emerald-300 flex items-center gap-2">
                        <span>Correto! Excelente identificação.</span>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </h3>
                      <p className="text-xs text-emerald-400">
                        Estrutura identificada: <strong className="text-white text-sm">{card.targetName}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                    +1 Acerto
                  </span>
                </div>

                {matchResult?.feedbackTip && (
                  <p className="text-xs text-emerald-300/90 italic bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                    {matchResult.feedbackTip}
                  </p>
                )}
              </div>
            ) : (
              /* FEEDBACK NEGATIVO (VERMELHO COM GABARITO E COMPARAÇÃO) */
              <div className="p-4 sm:p-5 rounded-xl bg-rose-950/60 border-2 border-rose-500/80 text-rose-100 flex flex-col gap-3 shadow-lg shadow-rose-950/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 font-bold flex-shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-rose-300">
                        Resposta Incorreta
                      </h3>
                      <p className="text-xs text-rose-400">
                        Confira o gabarito oficial e revise o local apontado na mira.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOverrideCorrect(card.id);
                      setMatchResult({ isMatch: true, score: 1, matchedWith: userInput });
                      soundManager.playSuccess();
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 font-medium whitespace-nowrap"
                    title="Clique se sua resposta for uma variação médica válida"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Considerar Correto</span>
                  </button>
                </div>

                {/* Comparação: O que digitou vs Gabarito Oficial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 pt-3 border-t border-rose-900/50">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                      O que você digitou:
                    </span>
                    <span className="font-mono text-sm text-rose-300 font-bold break-words">
                      {userInput || '(em branco)'}
                    </span>
                  </div>

                  <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60">
                    <span className="text-[11px] font-semibold uppercase text-emerald-400 block mb-1">
                      Gabarito Oficial:
                    </span>
                    <span className="font-mono text-sm text-emerald-200 font-bold break-words">
                      {card.targetName}
                    </span>
                  </div>
                </div>

                {/* Variações e Sinônimos Aceitos */}
                {card.synonyms.length > 0 && (
                  <div className="text-xs text-rose-300/80">
                    <span className="font-semibold text-rose-200">Variações e termos aceitos: </span>
                    <span>{card.synonyms.join(' • ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* NOTAS CLÍNICAS E ANATÔMICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 font-semibold block mb-0.5">Descrição Anatômica:</strong>
                  <p className="text-slate-300 leading-relaxed">{card.hint}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                <Stethoscope className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 font-semibold block mb-0.5">Relevância Clínica & Prática:</strong>
                  <p className="text-slate-300 leading-relaxed">{card.clinicalNote}</p>
                </div>
              </div>
            </div>

            {/* Ações de Navegação Pós-Resposta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleRetryCard}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tentar Novamente Este Card</span>
              </button>

              <button
                onClick={onNextCard}
                autoFocus
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-950 ml-auto active:scale-98"
              >
                <span>Próximo Card</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-900 hidden sm:inline">
                  Enter ↵
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Global Previous / Next Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <button
            onClick={onPrevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 text-slate-300 font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Card Anterior</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Dica: Use as setas do teclado ← e → para navegar
          </span>

          <button
            onClick={onNextCard}
            disabled={currentIndex >= totalCards - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 text-slate-300 font-medium transition-all"
          >
            <span>Próximo Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="text-white font-bold text-base">{card.boneGroup}</h4>
              <p className="text-xs text-slate-400">Visualização de alta resolução da peça anatômica</p>
            </div>
            <button
              onClick={() => setIsFullscreenModal(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Fechar [ESC]
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-auto p-2">
            <img
              src={card.image}
              alt={card.title}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
