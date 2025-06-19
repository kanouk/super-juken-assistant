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
  
  // 完全なKaTeX設定（化学式サポート含む）
  const katexOptions = {
    strict: false,
    throwOnError: false,
    output: 'html',
    trust: true,
    globalGroup: true,
    macros: {
      // 化学式サポート
      "\\ce": "\\mathrm{#1}",
      "\\pu": "\\mathrm{#1}",
      
      // 数学記号
      "\\R": "\\mathbb{R}",
      "\\N": "\\mathbb{N}",
      "\\Z": "\\mathbb{Z}",
      "\\Q": "\\mathbb{Q}",
      "\\C": "\\mathbb{C}",
      
      // 行列環境
      "\\bmat": "\\begin{bmatrix}#1\\end{bmatrix}",
      "\\pmat": "\\begin{pmatrix}#1\\end{pmatrix}",
      "\\vmat": "\\begin{vmatrix}#1\\end{vmatrix}",
      
      // 一般的な演算子
      "\\d": "\\mathrm{d}",
      "\\e": "\\mathrm{e}",
      "\\i": "\\mathrm{i}",
      
      // 化学反応の矢印
      "\\yields": "\\rightarrow",
      "\\equilibrium": "\\rightleftharpoons",
      
      // 単位記号（化学・物理）
      "\\unit": "\\,\\mathrm{#1}",
      "\\mol": "\\,\\mathrm{mol}",
      "\\kg": "\\,\\mathrm{kg}",
      "\\meter": "\\,\\mathrm{m}",
      "\\second": "\\,\\mathrm{s}",
      "\\ampere": "\\,\\mathrm{A}",
      "\\kelvin": "\\,\\mathrm{K}",
      "\\joule": "\\,\\mathrm{J}",
      "\\pascal": "\\,\\mathrm{Pa}",
      "\\volt": "\\,\\mathrm{V}",
      "\\watt": "\\,\\mathrm{W}",
      "\\hertz": "\\,\\mathrm{Hz}",
      "\\newton": "\\,\\mathrm{N}",
      "\\coulomb": "\\,\\mathrm{C}",
      "\\farad": "\\,\\mathrm{F}",
      "\\ohm": "\\,\\Omega"
    }
  };

  // 強化されたコンテンツ前処理関数
  const processContent = (text: string) => {
    let processed = text;
    
    try {
      console.log('LaTeX処理開始:', processed.substring(0, 200));
      
      // Step 1: 不正な改行文字の修正（単独の \ を \\ に変換）
      processed = processed.replace(/(?<!\\)\\(?![\\a-zA-Z{}])/g, '\\\\');
      
      // Step 2: 数式環境の完全処理（アスタリスク付き含む）
      const mathEnvironments = [
        'align', 'align*', 'gather', 'gather*', 'equation', 'equation*', 
        'eqnarray', 'eqnarray*', 'multline', 'multline*', 'split',
        'cases', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix'
      ];
      
      mathEnvironments.forEach(env => {
        // エスケープされた環境名でマッチング
        const escapedEnv = env.replace('*', '\\*');
        const pattern = new RegExp(`(\\\\begin\\{${escapedEnv}\\}[\\s\\S]*?\\\\end\\{${escapedEnv}\\})`, 'g');
        
        processed = processed.replace(pattern, (match) => {
          console.log(`${env}環境を検出:`, match.substring(0, 50));
          // 既に$$で囲まれていない場合のみ追加
          if (!match.trim().startsWith('$$') && !match.trim().endsWith('$$')) {
            return `$$\n${match.trim()}\n$$`;
          }
          return match;
        });
      });
      
      // Step 3: 不正な数式ブロックの修正
      // 単独の$を$$に変換（行の開始または終了にある場合）
      processed = processed.replace(/^\$([^$\n]+)\$$/gm, '$$\n$1\n$$');
      
      // Step 4: LaTeX区切り文字の正規化
      // \( \) を $ $ に変換（インライン数式）
      processed = processed.replace(/\\\((.*?)\\\)/gs, '$$$1$$');
      
      // \[ \] を $$ $$ に変換（ディスプレイ数式）
      processed = processed.replace(/\\\[(.*?)\\\]/gs, '$$\n$1\n$$');
      
      // Step 5: 化学式の処理（安全に）
      processed = processed.replace(/(^|[^$])\\ce\{([^}]+)\}([^$]|$)/g, '$1$$\\ce{$2}$$$3');
      
      // Step 6: 不完全な$$の修正
      const lines = processed.split('\n');
      const fixedLines = [];
      let inMathBlock = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '$$') {
          if (inMathBlock) {
            fixedLines.push('$$');
            inMathBlock = false;
          } else {
            fixedLines.push('$$');
            inMathBlock = true;
          }
        } else if (line.startsWith('$$') && line.length > 2) {
          // 開始と内容が同じ行にある場合
          fixedLines.push('$$');
          fixedLines.push(line.substring(2));
          inMathBlock = true;
        } else if (line.endsWith('$$') && line.length > 2) {
          // 内容と終了が同じ行にある場合
          fixedLines.push(line.substring(0, line.length - 2));
          fixedLines.push('$$');
          inMathBlock = false;
        } else {
          fixedLines.push(lines[i]);
        }
      }
      
      // 未閉じの数式ブロックを修正
      if (inMathBlock) {
        fixedLines.push('$$');
        console.log('未閉じの数式ブロックを修正しました');
      }
      
      processed = fixedLines.join('\n');
      
      // Step 7: エスケープ文字の修正
      processed = processed.replace(/\\&/g, '&');
      processed = processed.replace(/\\_(?![a-zA-Z])/g, '_');
      
      // Step 8: 過剰な空行の削除
      processed = processed.replace(/\$\$\s*\n\s*\n+/g, '$$\n');
      processed = processed.replace(/\n+\s*\$\$/g, '\n$$');
      
      // Step 9: 分数記法の修正
      processed = processed.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}');
      
      console.log('LaTeX処理完了:', processed.substring(0, 200));
      return processed;
    } catch (error) {
      console.warn('LaTeX前処理エラー:', error);
      // エラー時は最低限の安全な処理を行う
      return text.replace(/\\\[(.*?)\\\]/gs, '$$\n$1\n$$')
                 .replace(/\\\((.*?)\\\)/gs, '$$$1$$')
                 .replace(/(?<!\\)\\(?![\\a-zA-Z{}])/g, '\\\\');
    }
  };

  // エラーハンドリング付きレンダリング
  const renderWithErrorHandling = (content: string) => {
    try {
      return processContent(content);
    } catch (error) {
      console.error('数式レンダリングエラー:', error);
      // エラー時は元のコンテンツをそのまま返す
      return content;
    }
  };

  // Base text styling
  const baseTextClass = `font-sans text-[15px] leading-[1.7] break-words ${
    isUser ? 'text-white' : 'text-gray-900'
  }`;

  // Enhanced heading styles
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

  // Enhanced table styles
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

  // Code styling
  const codeStyles = {
    inline: `font-mono text-[0.9em] px-[0.3em] py-[0.1em] rounded ${
      isUser 
        ? 'bg-white/15 text-pink-200' 
        : 'bg-gray-100 text-pink-600'
    }`,
    block: 'my-4 rounded-lg overflow-hidden shadow-sm'
  };

  // Quote styling
  const blockquoteClass = `my-4 pl-4 pr-3 py-0.5 border-l-4 ${
    isUser 
      ? 'bg-blue-500/10 border-blue-400 text-blue-100' 
      : 'bg-blue-50 border-blue-400 text-blue-800'
  }`;

  // Link styling
  const linkClass = `${
    isUser ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'
  } underline decoration-1 underline-offset-2 transition-colors`;

  // Horizontal rule styling
  const hrClass = `my-8 border-0 h-[2px] ${
    isUser 
      ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' 
      : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
  }`;

  // List styling
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
          // Headings
          h1: ({ children }) => <h1 className={getHeadingClass(1)}>{children}</h1>,
          h2: ({ children }) => <h2 className={getHeadingClass(2)}>{children}</h2>,
          h3: ({ children }) => <h3 className={getHeadingClass(3)}>{children}</h3>,
          h4: ({ children }) => <h4 className={getHeadingClass(4)}>{children}</h4>,
          h5: ({ children }) => <h5 className={getHeadingClass(4)}>{children}</h5>,
          h6: ({ children }) => <h6 className={getHeadingClass(4)}>{children}</h6>,

          // Paragraphs
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,

          // Lists
          ul: ({ children }) => <ul className={`${listStyles.ul} list-disc`}>{children}</ul>,
          ol: ({ children }) => <ol className={`${listStyles.ol} list-decimal`}>{children}</ol>,
          li: ({ children }) => <li className={listStyles.li}>{children}</li>,

          // Tables
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

          // Enhanced code blocks
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

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={blockquoteClass}>{children}</blockquote>
          ),

          // Links
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

          // Images
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              loading="lazy"
              className="max-w-full h-auto my-4 rounded-lg shadow-md"
            />
          ),

          // Text formatting
          strong: ({ children }) => (
            <strong className={`font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),

          del: ({ children }) => (
            <del className="line-through opacity-60">{children}</del>
          ),

          // Horizontal rules
          hr: () => <hr className={hrClass} />,

          // Task list checkboxes
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
        {renderWithErrorHandling(content)}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMessageRenderer;
