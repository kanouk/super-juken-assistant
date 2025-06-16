
import { KatexOptions } from 'katex';

// KaTeX設定の統一管理
export const DEFAULT_KATEX_OPTIONS: KatexOptions = {
  displayMode: false,
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: false,
  output: 'html',
  fleqn: false,
  leqno: false,
  macros: {},
};

export const BLOCK_KATEX_OPTIONS: KatexOptions = {
  ...DEFAULT_KATEX_OPTIONS,
  displayMode: true,
};

export const INLINE_KATEX_OPTIONS: KatexOptions = {
  ...DEFAULT_KATEX_OPTIONS,
  displayMode: false,
};

// フォールバック用の簡易化学式レンダラー
export const renderSimpleChemistry = (formula: string): string => {
  return formula
    .replace(/(\d+)/g, '<sub>$1</sub>')
    .replace(/\^(\d+)/g, '<sup>$1</sup>')
    .replace(/\^(-?\d+)/g, '<sup>$1</sup>');
};

// LaTeX数式の妥当性チェック
export const isValidLatex = (math: string): boolean => {
  if (!math || math.trim() === '') return false;
  
  // 基本的な構文チェック
  const openBraces = (math.match(/\{/g) || []).length;
  const closeBraces = (math.match(/\}/g) || []).length;
  
  return openBraces === closeBraces;
};

// インライン数式が複数行になる可能性があるかチェック
export const shouldForceBlock = (math: string): boolean => {
  const multiLineIndicators = [
    '\\begin{', '\\end{', '\\\\', '\n', '\r',
    '\\frac{', '\\sum', '\\int', '\\prod',
    '\\matrix', '\\pmatrix', '\\bmatrix'
  ];
  
  return multiLineIndicators.some(indicator => math.includes(indicator));
};
