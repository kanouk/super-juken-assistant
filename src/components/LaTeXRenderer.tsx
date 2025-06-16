
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { parseLatexContent } from '../utils/latexProcessor';
import LatexBlock from './LaTeXRenderer/LatexBlock';
import LatexInline from './LaTeXRenderer/LatexInline';
import MarkdownText from './LaTeXRenderer/MarkdownText';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
}

const LaTeXRenderer = ({
  content,
  className = '',
  colorScheme = 'assistant',
}: LaTeXRendererProps) => {
  const baseColorClass =
    colorScheme === 'user'
      ? 'text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white !text-white'
      : 'text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900 prose-blockquote:text-gray-700 prose-code:text-gray-900 prose-pre:text-gray-900 !text-gray-800';

  const processedContent = useMemo(() => {
    const parsedParts = parseLatexContent(content);
    
    return parsedParts.map((part, index) => {
      switch (part.type) {
        case 'block-math':
          return (
            <LatexBlock
              key={index}
              math={part.content}
              colorScheme={colorScheme}
            />
          );
        
        case 'inline-math':
          return (
            <LatexInline
              key={index}
              math={part.content}
              colorScheme={colorScheme}
            />
          );
        
        case 'text':
          return (
            <MarkdownText
              key={index}
              content={part.content}
              colorScheme={colorScheme}
              className={className}
            />
          );
        
        default:
          return null;
      }
    });
  }, [content, colorScheme, className]);

  return (
    <div className={`${baseColorClass} leading-relaxed`} style={{ wordBreak: 'normal', whiteSpace: 'normal' }}>
      {processedContent.filter(Boolean)}
    </div>
  );
};

export default LaTeXRenderer;
