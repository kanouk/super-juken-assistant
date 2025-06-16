
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

// Import mhchem extension for chemical formulas
import 'katex/dist/contrib/mhchem.min.js';

interface UnifiedMarkdownLatexRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
}

const UnifiedMarkdownLatexRenderer: React.FC<UnifiedMarkdownLatexRendererProps> = ({
  content,
  className = "",
  colorScheme = "assistant"
}) => {
  // colorSchemeに応じてテキスト色を設定
  const textColorClass = colorScheme === "user" ? "text-white" : "text-gray-800";
  
  return (
    <div className={`math-content ${textColorClass} ${className}`}>
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
};

export default UnifiedMarkdownLatexRenderer;
