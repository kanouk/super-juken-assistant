
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface ChatMessageRendererProps {
  content: string;
  colorScheme: 'user' | 'assistant';
}

const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ content, colorScheme }) => {
  const isUser = colorScheme === 'user';
  
  // KaTeXオプション - 化学式サポートを含む完全版
  const katexOptions = {
    strict: false,
    throwOnError: false,
    output: 'html',
    trust: true,
    macros: {
      "\\ce": "\\mathrm{#1}",  // 化学式の簡易サポート
      "\\pu": "\\mathrm{#1}",
      "\\vec": "\\overrightarrow{#1}",
      "\\R": "\\mathbb{R}",
      "\\N": "\\mathbb{N}",
      "\\Z": "\\mathbb{Z}",
      "\\Q": "\\mathbb{Q}",
      "\\C": "\\mathbb{C}",
      "\\begin{pmatrix}": "\\begin{pmatrix}",
      "\\end{pmatrix}": "\\end{pmatrix}"
    }
  };

  // コンテンツの前処理
  const processContent = (text: string) => {
    // 角括弧の数式記法を標準記法に変換（オプション）
    let processed = text
      // 単独行の [ ] をブロック数式に変換
      .replace(/^\s*\[\s*([^\]]+)\s*\]\s*$/gm, '$$\n$1\n$$')
      // ブロック数式の前後に改行を確保
      .replace(/([^\n])\$\$/g, '$1\n$$')
      .replace(/\$\$([^\n])/g, '$$\n$1');
    
    return processed;
  };

  // 基本テキストスタイル
  const baseTextClass = `font-sans text-[15px] leading-[1.7] break-words ${
    isUser ? 'text-white' : 'text-gray-900'
  }`;

  // 見出しスタイル（改善版）
  const getHeadingClass = (level: number) => {
    const baseClass = `font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`;
    switch (level) {
      case 1:
        return `${baseClass} text-[1.8em] mt-[1.5em] mb-[0.8em] pb-[0.3em] border-b-2 ${
          isUser ? 'border-white/20' : 'border-gray-200'
        }`;
      case 2:
        return `${baseClass} text-[1.4em] mt-[1.3em] mb-[0.6em]`;
      case 3:
        return `${baseClass} text-[1.2em] mt-[1.2em] mb-[0.5em]`;
      default:
        return `${baseClass} text-[1.1em] mt-[1em] mb-[0.5em]`;
    }
  };

  // テーブルスタイル（改善版）
  const tableStyles = {
    wrapper: `overflow-x-auto my-4 rounded-lg ${
      isUser ? 'bg-black/10 shadow-inner' : 'bg-white shadow-sm border border-gray-200'
    }`,
    table: 'w-full border-collapse text-sm',
    thead: `${isUser ? 'bg-white/10' : 'bg-gray-50'}`,
    th: `font-semibold text-left px-4 py-3 ${
      isUser 
        ? 'text-white border-b-2 border-white/20' 
        : 'text-gray-900 border-b-2 border-gray-200'
    }`,
    td: `px-4 py-3 ${
      isUser 
        ? 'text-white border-b border-white/10' 
        : 'text-gray-900 border-b border-gray-100'
    }`,
    tr: `${isUser ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`
  };

  // コードスタイル
  const codeStyles = {
    inline: `font-mono text-[0.9em] px-[0.3em] py-[0.1em] rounded ${
      isUser 
        ? 'bg-white/15 text-pink-200' 
        : 'bg-gray-100 text-pink-600'
    }`,
    block: 'my-4 rounded-lg overflow-hidden shadow-sm'
  };

  // 引用スタイル
  const blockquoteClass = `my-4 pl-4 pr-3 py-0.5 border-l-4 ${
    isUser 
      ? 'bg-blue-500/10 border-blue-400 text-blue-100' 
      : 'bg-blue-50 border-blue-400 text-blue-800'
  }`;

  // リンクスタイル
  const linkClass = `${
    isUser ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'
  } underline decoration-1 underline-offset-2 transition-colors`;

  // 水平線スタイル
  const hrClass = `my-8 border-0 h-[2px] ${
    isUser 
      ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' 
      : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
  }`;

  // リストスタイル
  const listStyles = {
    ul: `mb-4 pl-6 ${isUser ? 'marker:text-white/60' : 'marker:text-gray-400'}`,
    ol: `mb-4 pl-6 ${isUser ? 'marker:text-white/60' : 'marker:text-gray-400'}`,
    li: 'mb-2 leading-relaxed'
  };

  return (
    <div className={baseTextClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, katexOptions]]}
        components={{
          // 見出し
          h1: ({ children }) => <h1 className={getHeadingClass(1)}>{children}</h1>,
          h2: ({ children }) => <h2 className={getHeadingClass(2)}>{children}</h2>,
          h3: ({ children }) => <h3 className={getHeadingClass(3)}>{children}</h3>,
          h4: ({ children }) => <h4 className={getHeadingClass(4)}>{children}</h4>,
          h5: ({ children }) => <h5 className={getHeadingClass(4)}>{children}</h5>,
          h6: ({ children }) => <h6 className={getHeadingClass(4)}>{children}</h6>,

          // 段落
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,

          // リスト
          ul: ({ children }) => <ul className={`${listStyles.ul} list-disc`}>{children}</ul>,
          ol: ({ children }) => <ol className={`${listStyles.ol} list-decimal`}>{children}</ol>,
          li: ({ children }) => <li className={listStyles.li}>{children}</li>,

          // テーブル
          table: ({ children }) => (
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className={tableStyles.thead}>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className={tableStyles.tr}>{children}</tr>,
          th: ({ children }) => <th className={tableStyles.th}>{children}</th>,
          td: ({ children }) => <td className={tableStyles.td}>{children}</td>,

          // コードブロック
          code: ({ children, className, ...rest }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return !isInline && match ? (
              <div className={codeStyles.block}>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  showLineNumbers={true}
                  customStyle={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}
                  {...rest}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={codeStyles.inline} {...rest}>
                {children}
              </code>
            );
          },

          // 引用
          blockquote: ({ children }) => (
            <blockquote className={blockquoteClass}>{children}</blockquote>
          ),

          // リンク
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className={linkClass}
            >
              {children}
            </a>
          ),

          // 画像
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              loading="lazy"
              className="max-w-full h-auto my-4 rounded-lg shadow-md"
            />
          ),

          // 強調
          strong: ({ children }) => (
            <strong className={`font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </strong>
          ),

          // イタリック
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),

          // 取り消し線
          del: ({ children }) => (
            <del className="line-through opacity-60">{children}</del>
          ),

          // 水平線
          hr: () => <hr className={hrClass} />,

          // タスクリスト用のチェックボックス
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className={`mr-2 ${
                    isUser 
                      ? 'accent-blue-400' 
                      : 'accent-blue-600'
                  }`}
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          }
        }}
      >
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMessageRenderer;
