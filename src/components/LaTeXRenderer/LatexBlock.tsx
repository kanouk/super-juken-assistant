
import React from 'react';
import { BlockMath } from 'react-katex';

interface LatexBlockProps {
  math: string;
  colorScheme: 'user' | 'assistant';
}

const LatexBlock: React.FC<LatexBlockProps> = ({ math, colorScheme }) => {
  if (!math.trim()) return null;

  try {
    return (
      <div className="my-6 flex justify-center">
        <BlockMath math={math} />
      </div>
    );
  } catch (error) {
    console.error('LaTeX Block Math Error:', error, 'Input:', math);
    return (
      <span
        className={`${
          colorScheme === 'user' ? 'text-red-200 bg-red-700' : 'text-red-700 bg-red-50'
        } px-2 py-1 rounded block my-2`}
      >
        LaTeX Block Error: {math}
      </span>
    );
  }
};

export default LatexBlock;
