import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  // Custom component for processing inline LaTeX within text
  const ProcessedText = ({ children }: { children: string }) => {
    const parts = children.split(/(\\\([\s\S]*?\\\)|\$[^$\n]+?\$)/);
    
    return (
      <>
        {parts.map((part, index) => {
          // Check if this part is inline LaTeX
          if (
            (part.startsWith('\\(') && part.endsWith('\\)')) ||
            (part.startsWith('$') && part.endsWith('$') && part.length > 2 && !part.includes('\n'))
          ) {
            let math = '';
            if (part.startsWith('\\(')) {
              math = part.slice(2, -2).trim();
            } else {
              math = part.slice(1, -1).trim();
            }
            
            if (math) {
              try {
                return <InlineMath key={index} math={math} />;
              } catch (error) {
                console.error('LaTeX Inline Math Error:', error, 'Input:', math);
                return (
                  <span
                    key={index}
                    className={`${
                      colorScheme === 'user' ? 'text-red-200 bg-red-700' : 'text-red-700 bg-red-50'
                    } px-1 rounded`}
                  >
                    LaTeX Error
                  </span>
                );
              }
            }
          }
          
          // Regular text - return as span to maintain proper rendering
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  const processedContent = useMemo(() => {
    // First, handle block math (display math) separately
    const blockMathRegex = /(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$)/g;
    const parts = content.split(blockMathRegex);
    
    return parts.map((part, index) => {
      // Handle block math
      if (
        (part.startsWith('\\[') && part.endsWith('\\]')) ||
        (part.startsWith('$$') && part.endsWith('$$') && part.length > 4)
      ) {
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
            return (
              <span
                key={index}
                className={`${
                  colorScheme === 'user' ? 'text-red-200 bg-red-700' : 'text-red-700 bg-red-50'
                } px-2 py-1 rounded`}
              >
                LaTeX Error
              </span>
            );
          }
        }
      }

      // Handle regular content with inline math
      if (part.trim()) {
        return (
          <div
            key={index}
            className={`prose prose-lg max-w-none break-words ${baseColorClass} ${className}`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1
                    className={`text-2xl font-bold mt-8 mb-4 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    className={`text-xl font-semibold mt-6 mb-3 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    className={`text-lg font-medium mt-5 mb-3 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p
                    className={`mb-4 leading-7 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {typeof children === 'string' ? (
                      <ProcessedText>{children}</ProcessedText>
                    ) : (
                      children
                    )}
                  </p>
                ),
                text: ({ children }) => {
                  if (typeof children === 'string') {
                    return <ProcessedText>{children}</ProcessedText>;
                  }
                  return children;
                },
                ul: ({ children }) => (
                  <ul
                    className={`mb-4 ml-6 space-y-2 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    className={`mb-4 ml-6 space-y-2 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li
                    className={`${colorScheme === 'user' ? 'text-white' : 'text-gray-800'} leading-6`}
                  >
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className={`border-l-4 border-blue-500 ${
                      colorScheme === 'user'
                        ? 'bg-blue-900 text-white'
                        : 'bg-blue-50 text-gray-700'
                    } pl-4 py-2 my-4 italic`}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ children, className: codeClassName }) => {
                  const isInline = !codeClassName;
                  if (isInline) {
                    return (
                      <code
                        className={`bg-gray-100 px-2 py-1 rounded text-sm font-mono ${
                          colorScheme === 'user' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={`${codeClassName} ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre
                    className={`bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4 ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {children}
                  </pre>
                ),
                strong: ({ children }) => (
                  <strong
                    className={`font-semibold ${
                      colorScheme === 'user' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em
                    className={`italic ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {children}
                  </em>
                ),
              }}
            >
              {part}
            </ReactMarkdown>
          </div>
        );
      }
      return null;
    });
  }, [content, colorScheme, className]);

  return (
    <div className={`${baseColorClass} leading-relaxed`}>
      {processedContent.filter(Boolean)}
    </div>
  );
};

export default LaTeXRenderer;
