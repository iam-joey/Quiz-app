"use client";

import React, { createContext, useContext, useState } from 'react';

type Choice = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  question: string;
  choice: Choice[];
};

type TestData = {
  id: string;
  question: Question[];
  testType: string;
  createdAt: string;
  duration: number;
  isCompleted: boolean;
};

type TestContextType = {
  testData: TestData | null;
  setTestData: (data: TestData | null) => void;
};

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [testData, setTestData] = useState<TestData | null>(null);

  return (
    <TestContext.Provider value={{ testData, setTestData }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTestContext must be used within a TestProvider');
  }
  return context;
};