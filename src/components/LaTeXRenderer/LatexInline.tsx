
import React from 'react';
import { InlineMath } from 'react-katex';

interface LatexInlineProps {
  math: string;
  colorScheme: 'user' | 'assistant';
}

const LatexInline: React.FC<LatexInlineProps> = ({ math, colorScheme }) => {
  if (!math.trim()) return null;

  try {
    return (
      <span 
        className="inline-block whitespace-nowrap" 
        style={{ 
          whiteSpace: 'nowrap', 
          display: 'inline-block',
          verticalAlign: 'baseline',
          lineHeight: '1'
        }}
      >
        <InlineMath 
          math={math}
          settings={{
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: false,
            output: 'html'
          }}
        />
      </span>
    );
  } catch (error) {
    console.error('LaTeX Inline Math Error:', error, 'Input:', math);
    return (
      <span
        className={`${
          colorScheme === 'user' ? 'text-red-200 bg-red-700' : 'text-red-700 bg-red-50'
        } px-1 rounded inline-block whitespace-nowrap`}
        style={{ 
          whiteSpace: 'nowrap', 
          display: 'inline-block',
          verticalAlign: 'baseline'
        }}
      >
        LaTeX Inline Error: {math}
      </span>
    );
  }
};

export default LatexInline;
