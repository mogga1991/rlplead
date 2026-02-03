import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 ml-60 mr-80 p-6 min-h-screen">
      {children}
    </main>
  );
};
