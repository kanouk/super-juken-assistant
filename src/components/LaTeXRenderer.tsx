
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

const LaTeXRenderer = ({ content, className = '' }: LaTeXRendererProps) => {
  const processedContent = useMemo(() => {
    const parts = content.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/);
    
    return parts.map((part, index) => {
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
              <div key={index} className="my-2 flex justify-center">
                <BlockMath math={math} />
              </div>
            );
          } catch (error) {
            console.error('LaTeX Block Math Error:', error, 'Input:', math);
            return <span key={index} className="text-red-500 bg-red-50 px-2 py-1 rounded">LaTeX Error</span>;
          }
        }
      }
      
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
              <InlineMath key={index} math={math} />
            );
          } catch (error) {
            console.error('LaTeX Inline Math Error:', error, 'Input:', math);
            return <span key={index} className="text-red-500 bg-red-50 px-1 rounded">LaTeX Error</span>;
          }
        }
      }
      
      if (part.trim()) { 
        return (
          // prose-smからprose-baseに変更し、行間を調整するために leading-relaxed を追加
          <div key={index} className="prose prose-base max-w-none dark:prose-invert leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {part}
            </ReactMarkdown>
          </div>
        );
      }
      return null; 
    });
  }, [content]);

  return (
    // classNameに渡される text-sm や text-base を優先しつつ、全体の行間を調整
    <div className={`${className} leading-relaxed`}>
      {processedContent.filter(Boolean)}
    </div>
  );
};

export default LaTeXRenderer;

