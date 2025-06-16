
import { useState } from 'react';

export const useSubject = () => {
  const [currentSubject, setCurrentSubject] = useState('other');
  
  return {
    currentSubject,
    setCurrentSubject,
  };
};
