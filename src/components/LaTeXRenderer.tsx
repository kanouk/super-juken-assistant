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
              <div key={index} className="my-6 flex justify-center">
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
          <div key={index} className="prose prose-lg max-w-none break-words prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white !text-white">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-5 mb-3 text-white">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-7 text-white">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 ml-6 space-y-2 text-white">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 ml-6 space-y-2 text-white">{children}</ol>,
                li: ({ children }) => <li className="text-white leading-6">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-white">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-white">{children}</code>;
                  }
                  return <code className={`${className} text-white`}>{children}</code>;
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4 text-white">
                    {children}
                  </pre>
                ),
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-white">{children}</em>,
              }}
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
    <div className={`${className} leading-relaxed text-white`}>
      {processedContent.filter(Boolean)}
    </div>
  );
};

export default LaTeXRenderer;
