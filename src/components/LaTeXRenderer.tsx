
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

const LaTeXRenderer = ({ content, className = '' }: LaTeXRendererProps) => {
  const processedContent = useMemo(() => {
    // More precise regex to match LaTeX expressions
    // This will match $$...$$, $...$ but avoid conflicts with regular text
    const parts = content.split(/(\$\$[^$]*?\$\$|\$[^$]+?\$)/);
    
    return parts.map((part, index) => {
      // Block math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const math = part.slice(2, -2).trim();
        if (math) {
          try {
            return (
              <div key={index} className="my-4 flex justify-center">
                <BlockMath math={math} />
              </div>
            );
          } catch (error) {
            console.error('LaTeX Block Math Error:', error);
            return <span key={index} className="text-red-500">LaTeX Error: {part}</span>;
          }
        }
      }
      
      // Inline math ($...$) - make sure it's not just a single $ or empty
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1).trim();
        if (math && !math.includes('\n')) { // Inline math shouldn't contain newlines
          try {
            return (
              <span key={index}>
                <InlineMath math={math} />
              </span>
            );
          } catch (error) {
            console.error('LaTeX Inline Math Error:', error);
            return <span key={index} className="text-red-500">LaTeX Error: {part}</span>;
          }
        }
      }
      
      // Regular text - preserve line breaks and handle Japanese properly
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [content]);

  return (
    <div className={`${className} leading-relaxed`}>
      {processedContent}
    </div>
  );
};

export default LaTeXRenderer;
