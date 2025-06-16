
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  colorScheme: 'user' | 'assistant';
}

// KaTeXオプション（化学式サポート含む）
const katexOptions = {
  strict: false,
  throwOnError: false,
  output: 'html',
  trust: true,
  macros: {
    "\\vec": "\\overrightarrow{#1}",
    "\\R": "\\mathbb{R}",
    "\\N": "\\mathbb{N}",
    "\\Z": "\\mathbb{Z}",
    "\\Q": "\\mathbb{Q}",
    "\\C": "\\mathbb{C}"
  }
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, colorScheme }) => {
  const isUser = colorScheme === 'user';
  
  // Base styling classes based on color scheme
  const baseClasses = `
    font-sans text-[15px] leading-relaxed break-words
    ${isUser ? 'text-white' : 'text-gray-900'}
  `;

  // Dynamic styling for different elements
  const getHeadingClasses = (level: number) => {
    const baseHeadingClass = `font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`;
    switch (level) {
      case 1:
        return `${baseHeadingClass} text-2xl mt-6 mb-3 pb-2 border-b-2 ${
          isUser ? 'border-white/20' : 'border-gray-200'
        }`;
      case 2:
        return `${baseHeadingClass} text-xl mt-5 mb-2`;
      case 3:
        return `${baseHeadingClass} text-lg mt-4 mb-2`;
      default:
        return `${baseHeadingClass} text-base mt-3 mb-2`;
    }
  };

  const getTableClasses = () => ({
    wrapper: `overflow-x-auto my-4 rounded-lg shadow-sm ${
      isUser ? 'bg-black/10' : 'bg-white'
    }`,
    table: 'w-full border-collapse text-sm',
    th: `font-semibold text-left px-4 py-3 ${
      isUser 
        ? 'bg-white/10 text-white border-b-2 border-white/20' 
        : 'bg-gray-50 text-gray-900 border-b-2 border-gray-200'
    }`,
    td: `px-4 py-3 ${
      isUser 
        ? 'text-white border-b border-white/10' 
        : 'text-gray-900 border-b border-gray-100'
    }`
  });

  const getCodeClasses = () => ({
    inline: `font-mono text-sm px-1.5 py-0.5 rounded ${
      isUser 
        ? 'bg-white/15 text-pink-200' 
        : 'bg-gray-100 text-pink-600'
    }`,
    block: 'my-4 rounded-lg overflow-hidden'
  });

  const getBlockquoteClasses = () => `
    my-4 px-4 py-2 border-l-4 ${
      isUser 
        ? 'bg-blue-500/10 border-blue-400 text-blue-100' 
        : 'bg-blue-50 border-blue-400 text-blue-800'
    }
  `;

  const getLinkClasses = () => `
    ${isUser ? 'text-blue-200 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}
    underline decoration-1 underline-offset-2 transition-colors
  `;

  return (
    <div className={baseClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, katexOptions]]}
        components={{
          // Headings
          h1: ({ children }) => <h1 className={getHeadingClasses(1)}>{children}</h1>,
          h2: ({ children }) => <h2 className={getHeadingClasses(2)}>{children}</h2>,
          h3: ({ children }) => <h3 className={getHeadingClasses(3)}>{children}</h3>,
          h4: ({ children }) => <h4 className={getHeadingClasses(4)}>{children}</h4>,
          h5: ({ children }) => <h5 className={getHeadingClasses(4)}>{children}</h5>,
          h6: ({ children }) => <h6 className={getHeadingClasses(4)}>{children}</h6>,

          // Paragraphs
          p: ({ children }) => <p className="mb-4">{children}</p>,

          // Lists
          ul: ({ children }) => <ul className="mb-4 pl-8 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 pl-8 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,

          // Tables
          table: ({ children }) => {
            const classes = getTableClasses();
            return (
              <div className={classes.wrapper}>
                <table className={classes.table}>{children}</table>
              </div>
            );
          },
          th: ({ children }) => <th className={getTableClasses().th}>{children}</th>,
          td: ({ children }) => <td className={getTableClasses().td}>{children}</td>,

          // Code blocks with syntax highlighting
          code: ({ children, className, ...rest }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return !isInline && match ? (
              <div className={getCodeClasses().block}>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  showLineNumbers={true}
                  {...rest}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={getCodeClasses().inline} {...rest}>
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={getBlockquoteClasses()}>{children}</blockquote>
          ),

          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className={getLinkClasses()}
            >
              {children}
            </a>
          ),

          // Images
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              loading="lazy"
              className="max-w-full h-auto my-4 rounded-lg shadow-md"
            />
          ),

          // Strong text
          strong: ({ children }) => (
            <strong className={`font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </strong>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
