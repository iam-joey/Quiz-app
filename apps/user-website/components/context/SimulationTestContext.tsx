"use client";
import React, { createContext, useContext, useState } from 'react';

interface Choice {
  id: string;
  text: string;
}

interface Question {
  level: any;
  title: string;
  choice: Choice[];
}

interface SimulationTestData {
  id: string;
  singleQuestion: Question[];
  multipleQuestion: Question[];
  testType: string;
  createdAt: string;
  duration: number;
  isCompleted: boolean;
}

interface SimulationTestContextType {
  simulationTestData: SimulationTestData | null;
  setSimulationTestData: (data: SimulationTestData | null) => void;
}

const SimulationTestContext = createContext<SimulationTestContextType | undefined>(undefined);

export const SimulationTestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulationTestData, setSimulationTestData] = useState<SimulationTestData | null>(null);

  return (
    <SimulationTestContext.Provider value={{ simulationTestData, setSimulationTestData }}>
      {children}
    </SimulationTestContext.Provider>
  );
};

export const useSimulationTestContext = () => {
  const context = useContext(SimulationTestContext);
  if (context === undefined) {
    throw new Error('useSimulationTestContext must be used within a SimulationTestProvider');
  }
  return context;
};