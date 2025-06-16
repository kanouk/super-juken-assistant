
import React from 'react';
import ChatMessageRenderer from './ChatMessageRenderer';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  colorScheme?: "user" | "assistant";
  debugMode?: boolean;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ 
  content, 
  className, 
  colorScheme = "assistant" 
}) => {
  return (
    <div className={className}>
      <ChatMessageRenderer content={content} colorScheme={colorScheme} />
    </div>
  );
};

export default LaTeXRenderer;
