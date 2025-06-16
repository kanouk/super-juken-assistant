
import React from 'react';
import UnifiedMarkdownLatexRenderer from './UnifiedMarkdownLatexRenderer';
import '../styles/markdown-latex.css';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
  debugMode?: boolean;
}

// 改良されたMarkdown+LaTeX統合レンダラー
const LaTeXRenderer: React.FC<LaTeXRendererProps> = (props) => {
  console.log('LaTeXRenderer: Using enhanced UnifiedMarkdownLatexRenderer with LaTeX parser');
  return <UnifiedMarkdownLatexRenderer {...props} />;
};

export default LaTeXRenderer;
