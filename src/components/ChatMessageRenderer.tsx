
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import './ChatMessageRenderer.css';

interface ChatMessageRendererProps {
  content: string;
  colorScheme?: 'user' | 'assistant';
}

// KaTeXに化学式マクロを追加
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
    "\\C": "\\mathbb{C}"
  }
};

export default function ChatMessageRenderer({ content, colorScheme = 'assistant' }: ChatMessageRendererProps) {
  // LaTeXのエスケープを処理
  const processContent = (text: string) => {
    // ブロック数式のバックスラッシュを保護
    return text.replace(/\$\$/g, '\n$$\n');
  };

  return (
    <div className={`chat-message-content ${colorScheme === 'user' ? 'user-message' : 'assistant-message'}`}>
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
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
}
