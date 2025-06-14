
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

const LaTeXRenderer = ({ content, className = '' }: LaTeXRendererProps) => {
  const processedContent = useMemo(() => {
    // より正確なLaTeX検出のための改良された正規表現
    // \( ... \) をインライン数式として、\[ ... \] をブロック数式として扱う
    const parts = content.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/);
    
    return parts.map((part, index) => {
      // ブロック数式 \[ ... \] または $$ ... $$
      if ((part.startsWith('\\[') && part.endsWith('\\]')) || 
          (part.startsWith('$$') && part.endsWith('$$') && part.length > 4)) {
        let math = '';
        if (part.startsWith('\\[')) {
          math = part.slice(2, -2).trim();
        } else {
          math = part.slice(2, -2).trim();
        }
        
        if (math) {
          try {
            return (
              <div key={index} className="my-4 flex justify-center">
                <BlockMath math={math} />
              </div>
            );
          } catch (error) {
            console.error('LaTeX Block Math Error:', error);
            return <span key={index} className="text-red-500 bg-red-50 px-2 py-1 rounded">LaTeX Error: {part}</span>;
          }
        }
      }
      
      // インライン数式 \( ... \) または $ ... $
      if ((part.startsWith('\\(') && part.endsWith('\\)')) ||
          (part.startsWith('$') && part.endsWith('$') && part.length > 2 && !part.includes('\n'))) {
        let math = '';
        if (part.startsWith('\\(')) {
          math = part.slice(2, -2).trim();
        } else {
          math = part.slice(1, -1).trim();
        }
        
        if (math) {
          try {
            return (
              <span key={index}>
                <InlineMath math={math} />
              </span>
            );
          } catch (error) {
            console.error('LaTeX Inline Math Error:', error);
            return <span key={index} className="text-red-500 bg-red-50 px-1 rounded">LaTeX Error: {part}</span>;
          }
        }
      }
      
      // 通常のテキスト - 改行を保持し、日本語を適切に処理
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
