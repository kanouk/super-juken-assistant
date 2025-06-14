
import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  content: string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
  renderer?: (content: string) => React.ReactNode;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  content,
  className = '',
  speed = 50,
  onComplete,
  renderer,
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete && content.length > 0) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, content, speed, onComplete, isComplete]);

  // Reset when content changes
  useEffect(() => {
    setDisplayedContent('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [content]);

  if (renderer) {
    return <div className={className}>{renderer(displayedContent)}</div>;
  }

  return (
    <div className={`${className} whitespace-pre-wrap`}>
      {displayedContent}
    </div>
  );
};

export default TypewriterEffect;
