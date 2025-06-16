
import React from 'react';
import MarkdownLatexRenderer from './MarkdownLatexRenderer';
import '../styles/markdown-latex.css';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
}

// 新しい実装への移行用ラッパー
const LaTeXRenderer: React.FC<LaTeXRendererProps> = (props) => {
  console.log('LaTeXRenderer: Using new MarkdownLatexRenderer implementation');
  return <MarkdownLatexRenderer {...props} />;
};

export default LaTeXRenderer;
