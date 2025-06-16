
import React from 'react';
import MarkdownLatexRenderer from './MarkdownLatexRenderer';
import '../styles/markdown-latex.css';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
  debugMode?: boolean;
}

// 改良されたMarkdown+LaTeX統合レンダラー
const LaTeXRenderer: React.FC<LaTeXRendererProps> = (props) => {
  console.log('LaTeXRenderer: Using enhanced MarkdownLatexRenderer with LaTeX parser');
  return <MarkdownLatexRenderer {...props} />;
};

export default LaTeXRenderer;
