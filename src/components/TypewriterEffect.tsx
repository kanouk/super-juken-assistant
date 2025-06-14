
import React, { useState, useEffect } from 'react';
import LaTeXRenderer from "./LaTeXRenderer";

interface TypewriterEffectProps {
  content: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  content, 
  speed = 30, // 少し早めのデフォルト速度
  className,
  onComplete 
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // contentが変更されたら、表示内容とインデックスをリセット
    setDisplayedContent('');
    setCurrentIndex(0);
  }, [content]);

  useEffect(() => {
    if (!content) {
      if (onComplete) onComplete();
      return;
    }

    if (currentIndex < content.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    } else {
      // タイプ完了
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, content, speed, onComplete]);

  return <LaTeXRenderer content={displayedContent} className={className} />;
};

export default TypewriterEffect;
