
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

interface MathDisplayProps {
  content: string;
}

export default function MathDisplay({ content }: MathDisplayProps) {
  return (
    <div className="math-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            strict: false,
            throwOnError: false,
            globalGroup: true,
            fleqn: false,
            displayMode: true
          }]
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
