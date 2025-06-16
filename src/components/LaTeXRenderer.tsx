
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { parseLatexContent } from '../utils/newLatexProcessor';
import UnifiedLatexRenderer from './LaTeXRenderer/UnifiedLatexRenderer';
import MarkdownText from './LaTeXRenderer/MarkdownText';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
}

const LaTeXRenderer = ({
  content,
  className = '',
  colorScheme = 'assistant',
}: LaTeXRendererProps) => {
  const baseColorClass =
    colorScheme === 'user'
      ? 'text-white prose-headings:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white !text-white'
      : 'text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900 prose-li:text-gray-900 prose-blockquote:text-gray-700 prose-code:text-gray-900 prose-pre:text-gray-900 !text-gray-800';

  const processedContent = useMemo(() => {
    console.log('LaTeXRenderer: Processing content:', content.substring(0, 100) + '...');
    
    const parsedParts = parseLatexContent(content);
    console.log('LaTeXRenderer: Parsed into', parsedParts.length, 'parts');
    
    return parsedParts.map((part, index) => {
      console.log(`LaTeXRenderer: Rendering part ${index}:`, part.type, part.content.substring(0, 50));
      
      switch (part.type) {
        case 'block-math':
        case 'inline-math':
          return (
            <UnifiedLatexRenderer
              key={index}
              type={part.type}
              content={part.content}
              colorScheme={colorScheme}
              isChemistry={part.isChemistry}
              originalMatch={part.originalMatch}
            />
          );
        
        case 'text':
          return (
            <MarkdownText
              key={index}
              content={part.content}
              colorScheme={colorScheme}
              className={className}
            />
          );
        
        default:
          return null;
      }
    });
  }, [content, colorScheme, className]);

  return (
    <div 
      className={`${baseColorClass} leading-relaxed`} 
      style={{ 
        wordBreak: 'keep-all', 
        whiteSpace: 'normal',
        overflowWrap: 'anywhere'
      }}
    >
      {processedContent.filter(Boolean)}
    </div>
  );
};

export default LaTeXRenderer;
