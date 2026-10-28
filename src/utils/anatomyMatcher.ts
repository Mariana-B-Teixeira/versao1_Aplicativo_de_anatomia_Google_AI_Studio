import { MatchResult } from '../types/anatomy';

/**
 * Remove acentuação e caracteres especiais, converte para minúsculas
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos/acentos
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ') // substitui pontuação por espaço
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza termos anatômicos removendo prefixos redundantes comuns
 * (ex: "osso parietal" -> "parietal", "proc. coracoide" -> "processo coracoide")
 */
function cleanAnatomyPrefixes(str: string): string {
  let s = str
    .replace(/^osso\s+/, '')
    .replace(/^processo\s+/, '')
    .replace(/^proc\s+/, '')
    .replace(/^proc\.\s*/, '')
    .replace(/^espinha\s+/, '')
    .replace(/^fossa\s+/, '')
    .replace(/^tuberculo\s+/, '')
    .replace(/^tuberosidade\s+/, '')
    .replace(/^cabeca\s+/, '')
    .replace(/^colo\s+/, '')
    .replace(/^condilo\s+/, '')
    .replace(/^epicondilo\s+/, '')
    .replace(/^incisura\s+/, '')
    .replace(/^forame\s+/, '')
    .replace(/^margem\s+/, '')
    .replace(/^borda\s+/, '')
    .replace(/^angulo\s+/, '')
    .replace(/^sutura\s+/, '')
    .replace(/^art\.\s*/, '')
    .replace(/^articulacao\s+/, '');
  return s.trim();
}

/**
 * Distância de Levenshtein para tolerar pequenos desvios de digitação
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Validação rigorosa e inteligente da resposta anatômica
 */
export function validateAnatomyAnswer(
  userAnswer: string,
  targetName: string,
  synonyms: string[] = []
): MatchResult {
  const cleanInput = normalizeText(userAnswer);
  if (!cleanInput) {
    return { isMatch: false, score: 0 };
  }

  // Lista de todos os termos válidos (alvo principal + sinônimos cadastrados)
  const allCandidates = [targetName, ...synonyms].map((c) => normalizeText(c));

  // 1. Checagem exata (após normalização de acentos e caixa)
  for (const candidate of allCandidates) {
    if (cleanInput === candidate) {
      return { isMatch: true, score: 1, matchedWith: candidate };
    }
  }

  // 2. Checagem sem artigos ou preposições comuns ("do", "da", "de", "o", "a")
  const stripArticles = (s: string) =>
    s
      .split(' ')
      .filter((w) => !['do', 'da', 'de', 'dos', 'das', 'o', 'a', 'os', 'as'].includes(w))
      .join(' ');

  const inputNoArticles = stripArticles(cleanInput);
  for (const candidate of allCandidates) {
    if (inputNoArticles === stripArticles(candidate)) {
      return { isMatch: true, score: 0.98, matchedWith: candidate };
    }
  }

  // 3. Checagem de termo simplificado sem prefixo (ex: digitou "coracoide" para "processo coracoide")
  const inputStripped = cleanAnatomyPrefixes(inputNoArticles);
  for (const candidate of allCandidates) {
    const candidateStripped = cleanAnatomyPrefixes(stripArticles(candidate));
    if (inputStripped.length >= 4 && inputStripped === candidateStripped) {
      return { isMatch: true, score: 0.95, matchedWith: candidate };
    }
  }

  // 4. Checagem por Levenshtein (tolerância a pequenos erros de grafia médica, ex: psiforme vs pisiforme)
  for (const candidate of allCandidates) {
    const dist = levenshteinDistance(cleanInput, candidate);
    // Se o termo tiver mais de 4 caracteres e apenas 1 caractere errado
    if (candidate.length >= 5 && dist === 1) {
      return {
        isMatch: true,
        score: 0.9,
        matchedWith: candidate,
        feedbackTip: `Aceito com ressalva ortográfica (você digitou "${userAnswer}", padrão: "${candidate}")`,
      };
    }
    // Para termos compostos longos (> 12 caracteres), permite até 2 erros
    if (candidate.length >= 13 && dist <= 2) {
      return {
        isMatch: true,
        score: 0.85,
        matchedWith: candidate,
        feedbackTip: `Aceito por aproximação fonética/ortográfica`,
      };
    }

    // Levenshtein no termo simplificado
    const distStripped = levenshteinDistance(inputStripped, cleanAnatomyPrefixes(stripArticles(candidate)));
    if (inputStripped.length >= 5 && distStripped === 1) {
      return {
        isMatch: true,
        score: 0.88,
        matchedWith: candidate,
      };
    }
  }

  // Se não coincidiu
  return { isMatch: false, score: 0 };
}
