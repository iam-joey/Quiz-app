"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type LearningTopicContextType = {
  learningTopicData: any;
  setLearningTopicData: (data: any) => void;
};

const LearningTopicContext = createContext<LearningTopicContextType | undefined>(undefined);

export const LearningTopicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [learningTopicData, setLearningTopicData] = useState<any>(null);

  return (
    <LearningTopicContext.Provider value={{ learningTopicData, setLearningTopicData }}>
      {children}
    </LearningTopicContext.Provider>
  );
};

export const useLearningTopic = () => {
  const context = useContext(LearningTopicContext);
  if (context === undefined) {
    throw new Error('useLearningTopic must be used within a LearningTopicProvider');
  }
  return context;
};