
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

// Import mhchem extension for chemical formulas
import 'katex/dist/contrib/mhchem.min.js';

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
            displayMode: true,
            trust: true,
            macros: {
              "\\ce": "\\ce",
              "\\pu": "\\pu"
            }
          }]
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
