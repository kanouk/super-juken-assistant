
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
  const baseClasses = colorScheme === 'user' 
    ? 'markdown-content user-message'
    : 'markdown-content assistant-message';

  return (
    <div className={baseClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, katexOptions]]}
        components={{
          // コードブロックのシンタックスハイライト
          code(props) {
            const { children, className, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return !isInline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="syntax-highlighter"
                showLineNumbers={true}
                {...rest}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          // 表のカスタムレンダリング
          table({ children }) {
            return (
              <div className="table-wrapper">
                <table>{children}</table>
              </div>
            );
          },
          // リンクを新しいタブで開く
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          // 画像のレスポンシブ対応
          img({ src, alt }) {
            return (
              <img src={src} alt={alt} loading="lazy" />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
