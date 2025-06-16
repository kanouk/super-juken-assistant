
import { create } from 'zustand';
import confetti from 'canvas-confetti';

interface ConfettiStore {
  celebrate: () => void;
}

export const useConfettiStore = create<ConfettiStore>(() => ({
  celebrate: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  },
}));
