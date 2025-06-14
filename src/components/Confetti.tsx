
import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiComponent: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const fireConfetti = useCallback(() => {
    const duration = 2 * 1000; // 2 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 25, 
      spread: 360, 
      ticks: 50, 
      zIndex: 9999, // より高いz-indexに設定
      scalar: 0.8,
      disableForReducedMotion: true // アクセシビリティ向上
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: number = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }

      const particleCount = 40 * (timeLeft / duration);
      // より控えめな位置に調整してスクロールを防ぐ
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.2, 0.4), y: 0.6 } 
      }));
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.6, 0.8), y: 0.6 } 
      }));
    }, 200);

    // 初回の爆発エフェクトも位置を調整
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { x: 0.5, y: 0.6 }, // 中央に固定
      scalar: 1,
      zIndex: 9999,
      disableForReducedMotion: true
    });

  }, [onComplete]);

  useEffect(() => {
    if (trigger) {
      // スクロール位置を保存
      const scrollY = window.scrollY;
      
      fireConfetti();
      
      // confetti発火後にスクロール位置を復元
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 50);
    }
  }, [trigger, fireConfetti]);

  return null;
};

export default ConfettiComponent;
