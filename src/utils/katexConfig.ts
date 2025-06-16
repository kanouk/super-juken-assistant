
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

// インライン数式が複数行になる可能性があるかチェック（より厳密に）
export const shouldForceBlock = (math: string): boolean => {
  // 文字数による判定を追加
  if (math.length > 50) return true;
  
  const multiLineIndicators = [
    '\\begin{', '\\end{', '\\\\', '\n', '\r',
    '\\frac{', '\\sum', '\\int', '\\prod',
    '\\matrix', '\\pmatrix', '\\bmatrix',
    '\\times', '\\vec{', '\\sin', '\\cos', '\\tan',
    '\\alpha', '\\beta', '\\gamma', '\\theta',
    // 長い数式パターンを追加
    'pmatrix', 'bmatrix', 'vmatrix',
    '\\cdot', '\\bullet'
  ];
  
  // 複数の数学記号が含まれている場合もブロック化
  const mathSymbolCount = multiLineIndicators.filter(indicator => 
    math.includes(indicator)
  ).length;
  
  return mathSymbolCount >= 3 || multiLineIndicators.some(indicator => math.includes(indicator));
};

// 長い数式の自動検出と分割
export const detectLongFormula = (math: string): boolean => {
  // 50文字以上、または特定のパターンを含む場合は長い数式とみなす
  return math.length > 50 || 
         math.includes('\\begin{') || 
         math.includes('\\times') ||
         math.includes('\\vec{') ||
         (math.match(/\\/g) || []).length > 5; // バックスラッシュが5個以上
};
