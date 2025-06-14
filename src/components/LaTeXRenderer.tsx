
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

const LaTeXRenderer = ({ content, className = '' }: LaTeXRendererProps) => {
  const processedContent = useMemo(() => {
    // Split content by LaTeX delimiters while preserving the delimiters
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    
    return parts.map((part, index) => {
      // Block math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        return (
          <div key={index} className="my-4 flex justify-center">
            <BlockMath math={math} />
          </div>
        );
      }
      
      // Inline math ($...$)
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1).trim();
        return (
          <span key={index}>
            <InlineMath math={math} />
          </span>
        );
      }
      
      // Regular text - preserve line breaks
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [content]);

  return (
    <div className={className}>
      {processedContent}
    </div>
  );
};

export default LaTeXRenderer;
