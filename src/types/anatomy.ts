export type AnatomicalRegion = 'mmii' | 'cranio' | 'torax' | 'mmss' | 'todos';

export type CardStatus = 'pending' | 'correct' | 'incorrect';

export interface AnatomicalIndicator {
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  arrowDirection?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  pointerLabel?: string;
}

export interface AnatomyCard {
  id: string;
  region: 'mmii' | 'cranio' | 'torax' | 'mmss';
  boneGroup: string; // ex: "Fêmur", "Crânio", "Escápula"
  title: string; // Pergunta ou contexto, ex: "Identifique o acidente ósseo indicado"
  targetName: string; // Nome oficial em Português
  synonyms: string[]; // Variações, sinônimos, termos simplificados ou em latim
  image: string; // Caminho da imagem extraída do PDF original
  imageWidth?: number; // Largura intrínseca da imagem em pixels
  imageHeight?: number; // Altura intrínseca da imagem em pixels
  referenceSlideImage?: string; // Imagem do slide com gabarito anatômico completo da aula
  indicator: AnatomicalIndicator;
  hint: string; // Dica didática (ex: formato, articulação, inserção muscular)
  clinicalNote: string; // Relevância médica/clínica (ex: fraturas, palpação, ligamentos)
  isRadiograph?: boolean; // Se a imagem é uma radiografia (RX)
}

export interface CardAttempt {
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface UserProgress {
  attempts: Record<string, CardAttempt>; // cardId -> attempt
  starred: string[]; // cardIds
  lastCardIndexByRegion: Record<string, number>;
}

export interface MatchResult {
  isMatch: boolean;
  score: number; // 0 to 1
  matchedWith?: string;
  feedbackTip?: string;
}
