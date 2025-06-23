
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import WelcomePage from './WelcomePage';

const WelcomePageContainer = () => {
  return (
    <ErrorBoundary name="ウェルカムページ">
      <WelcomePage />
    </ErrorBoundary>
  );
};

export default WelcomePageContainer;
