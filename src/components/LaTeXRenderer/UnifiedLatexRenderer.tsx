
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  INLINE_KATEX_OPTIONS, 
  BLOCK_KATEX_OPTIONS, 
  isValidLatex, 
  shouldForceBlock,
  detectLongFormula,
  renderSimpleChemistry 
} from '../../utils/katexConfig';
import '../../styles/latex.css';

interface UnifiedLatexRendererProps {
  type: 'block-math' | 'inline-math';
  content: string;
  colorScheme: 'user' | 'assistant';
  isChemistry?: boolean;
  originalMatch?: string;
}

const UnifiedLatexRenderer: React.FC<UnifiedLatexRendererProps> = ({
  type,
  content,
  colorScheme,
  isChemistry = false,
  originalMatch
}) => {
  // 空のコンテンツは何も表示しない
  if (!content || !content.trim()) {
    return null;
  }

  // LaTeX妥当性チェック
  if (!isValidLatex(content)) {
    console.warn('Invalid LaTeX detected:', content);
    return <ErrorDisplay content={content} colorScheme={colorScheme} />;
  }

  // 長い数式の検出
  const isLongFormula = detectLongFormula(content);
  
  // インライン数式が複数行になる可能性がある場合、または長い数式の場合、ブロック数式に強制変換
  const finalType = (type === 'inline-math' && (shouldForceBlock(content) || isLongFormula)) 
    ? 'block-math' 
    : type;

  // 化学式の場合、簡易レンダラーを試行
  if (isChemistry && type === 'inline-math') {
    try {
      const chemHtml = renderSimpleChemistry(content);
      return (
        <span 
          className="chemistry-formula"
          dangerouslySetInnerHTML={{ __html: chemHtml }}
        />
      );
    } catch (error) {
      console.warn('Chemistry rendering failed, falling back to LaTeX:', error);
    }
  }

  try {
    if (finalType === 'block-math') {
      return (
        <div className="latex-block-container">
          <BlockMath math={content} {...BLOCK_KATEX_OPTIONS} />
        </div>
      );
    } else {
      // インライン数式用のクラス名を動的に決定
      const containerClass = isLongFormula 
        ? "latex-inline-container latex-long-formula"
        : "latex-inline-container";
        
      return (
        <span className={containerClass}>
          <InlineMath math={content} {...INLINE_KATEX_OPTIONS} />
        </span>
      );
    }
  } catch (error) {
    console.error('LaTeX rendering error:', error, 'Content:', content);
    return <ErrorDisplay content={content} colorScheme={colorScheme} error={String(error)} />;
  }
};

interface ErrorDisplayProps {
  content: string;
  colorScheme: 'user' | 'assistant';
  error?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ content, colorScheme, error }) => {
  const errorClass = colorScheme === 'user' ? 'latex-error--dark' : 'latex-error--light';
  
  return (
    <span 
      className={`latex-error ${errorClass}`}
      title={error ? `LaTeX Error: ${error}` : 'LaTeX Error'}
    >
      {content}
    </span>
  );
};

export default UnifiedLatexRenderer;
