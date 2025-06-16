
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LaTeXParser } from '../utils/latexParser';
import 'katex/dist/katex.min.css';

interface MarkdownLatexRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
  debugMode?: boolean;
}

const MarkdownLatexRenderer: React.FC<MarkdownLatexRendererProps> = ({
  content,
  className = '',
  colorScheme = 'assistant',
  debugMode = false,
}) => {
  const baseColorClass = useMemo(() => 
    colorScheme === 'user'
      ? 'text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white !text-white'
      : 'text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900 prose-blockquote:text-gray-700 prose-code:text-gray-900 prose-pre:text-gray-900 !text-gray-800'
  , [colorScheme]);

  const processedContent = useMemo(() => {
    console.log('MarkdownLatexRenderer: Processing content with debug mode:', debugMode);
    
    // デバッグモードを設定
    LaTeXParser.setDebugMode(debugMode);
    
    // LaTeX部分を解析・保護
    const parseResult = LaTeXParser.parse(content);
    
    return parseResult;
  }, [content, debugMode]);

  const renderedContent = useMemo(() => {
    // Markdownをレンダリング
    const markdownHtml = (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ヘッダー要素
          h1: ({ children }) => (
            <h1 className={`text-2xl font-bold mt-8 mb-4 ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-xl font-semibold mt-6 mb-3 ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-lg font-medium mt-5 mb-3 ${colorScheme === 'user' ? 'text-white' : 'text-gray-800'}`}>
              {children}
            </h3>
          ),
          
          // パラグラフ
          p: ({ children }) => (
            <p 
              className={`mb-4 leading-7 ${colorScheme === 'user' ? 'text-white' : 'text-gray-800'}`}
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'keep-all',
                overflowWrap: 'break-word'
              }}
            >
              {children}
            </p>
          ),
          
          // リスト要素
          ul: ({ children }) => (
            <ul className={`mb-4 ml-6 space-y-2 list-disc ${colorScheme === 'user' ? 'text-white' : 'text-gray-800'}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`mb-4 ml-6 space-y-2 list-decimal ${colorScheme === 'user' ? 'text-white' : 'text-gray-800'}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`${colorScheme === 'user' ? 'text-white' : 'text-gray-800'} leading-6`}>
              {children}
            </li>
          ),
          
          // 引用
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 border-blue-500 ${colorScheme === 'user' ? 'bg-blue-900/20 text-white' : 'bg-blue-50 text-gray-700'} pl-4 py-2 my-4 italic rounded-r`}>
              {children}
            </blockquote>
          ),
          
          // コードブロック
          code: ({ children, className: codeClassName, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code 
                  className={`${colorScheme === 'user' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-900'} px-2 py-1 rounded text-sm font-mono`}
                  style={{ whiteSpace: 'nowrap', display: 'inline-block' }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className={`${codeClassName} ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className={`${colorScheme === 'user' ? 'bg-black/20 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg p-4 overflow-x-auto my-4 font-mono text-sm`}>
              {children}
            </pre>
          ),
          
          // テーブル
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className={`min-w-full border-collapse ${colorScheme === 'user' ? 'border-white/20' : 'border-gray-200'} border`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={`${colorScheme === 'user' ? 'bg-white/10' : 'bg-gray-50'}`}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className={`${colorScheme === 'user' ? 'border-white/20 text-white' : 'border-gray-200 text-gray-900'} border px-4 py-2 text-left font-semibold`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`${colorScheme === 'user' ? 'border-white/20 text-white' : 'border-gray-200 text-gray-800'} border px-4 py-2`}>
              {children}
            </td>
          ),
          
          // 強調・斜体
          strong: ({ children }) => (
            <strong className={`font-semibold ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${colorScheme === 'user' ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </em>
          ),
          
          // 水平線
          hr: () => (
            <hr className={`my-6 ${colorScheme === 'user' ? 'border-white/20' : 'border-gray-200'}`} />
          ),
        }}
      >
        {processedContent.processedContent}
      </ReactMarkdown>
    );

    return markdownHtml;
  }, [processedContent, colorScheme]);

  return (
    <div 
      className={`${baseColorClass} ${className} leading-relaxed markdown-latex-container`}
      style={{ 
        wordBreak: 'keep-all', 
        whiteSpace: 'normal',
        overflowWrap: 'anywhere'
      }}
    >
      {renderedContent}
    </div>
  );
};

export default MarkdownLatexRenderer;
